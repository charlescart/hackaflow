/* eslint-disable no-param-reassign */
/* eslint-disable no-continue */
const moment = require('moment');
const fetch = require('node-fetch');

const brinksService = {
  /* description */
  getFirstStrip: (node, currentTime, timeInTraffic) => {
    const hourArrival = currentTime.clone();
    hourArrival.add(timeInTraffic);
    let firstStrip;
    let numberBands = 0;

    for (let i = 0; i < node.attentionHour.length; i += 1) {
      const hourEnd = moment.duration(node.attentionHour[i].end).clone();
      hourEnd.subtract(hourArrival);

      if (hourEnd.asSeconds() < 0) continue;

      // cuenta las bandas vidas
      numberBands += 1;

      if (firstStrip === undefined) {
        firstStrip = node.attentionHour[i];
        continue;
      }

      const afterStrip = moment.duration(firstStrip.end);
      afterStrip.subtract(hourArrival);

      if (afterStrip > hourEnd) firstStrip = node.attentionHour[i];
    }

    /* haciendo una duracion start and end */
    if (firstStrip !== undefined) {
      firstStrip.start = moment.duration(firstStrip.start);
      firstStrip.end = moment.duration(firstStrip.end);
    }

    // no cuento la franja que se selecciono, solo las restantes.
    if (numberBands > 0) numberBands -= 1;

    return { firstStrip, numberBands };
  },

  /* description */
  getDurationInTraffic: async (nodeA, nodeB, currentDate, currentTime) => {
    const baseUrl = 'https://router.hereapi.com/v8/routes?';
    const apiKey = process.env.API_KEY_TRAFFIC;

    let time = moment(currentDate);
    time.add(currentTime);
    time = time.format('YYYY-MM-DDTHH:mm:ss');

    const timeInTraffic = await fetch(`${baseUrl}transportMode=car&origin=${nodeA.coordinates.lat},${nodeA.coordinates.lng}&destination=${nodeB.coordinates.lat},${nodeB.coordinates.lng}&return=summary&departureTime=${time}&apiKey=${apiKey}`)
      .then((res) => res.json())
      .then((res) => res.routes[0].sections[0].summary.duration);

    return {
      description: nodeB.description,
      time: moment.duration(timeInTraffic, 'seconds'),
    };
  },

  /* description */
  getTrafficTimes: (nodeRoot, nodes, currentDate, currentTime) => {
    const baseUrl = 'https://router.hereapi.com/v8/routes?';
    const apiKey = process.env.API_KEY_TRAFFIC;
    const trafficTimes = [];
    const hourDeparture = currentDate
      .clone()
      .add(currentTime)
      .format('YYYY-MM-DDTHH:mm:ss');


    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].blocked || nodes[i].unfulfilled) continue;

      // const nodeIsInvalid = brinksService.getValidNodes(nodeRoot, nodes[i], unfulfilledNodes, currentTime);
      /* si el nodo es invalido lo excluyo de los query de traffic */
      // if (nodeIsInvalid) continue;

      trafficTimes.push(
        fetch(`${baseUrl}transportMode=car&origin=${nodeRoot.coordinates.lat},${nodeRoot.coordinates.lng}&destination=${nodes[i].coordinates.lat},${nodes[i].coordinates.lng}&return=summary&departureTime=${hourDeparture}&apiKey=${apiKey}`)
          .then((res) => res.json())
          .then((res) => {
            const time = moment.duration(res.routes[0].sections[0].summary.duration, 'seconds');
            return { description: nodes[i].description, time };
            // eslint-disable-next-line comma-dangle
          })
      );
    }

    return Promise.all(trafficTimes);
  },


  /* description */
  getArrival: (node, currentTime, durationInTraffic, firstStrip) => {
    const start = moment('00:00:00', 'HH:mm:ss');
    start.add(firstStrip.start);

    const end = moment('00:00:00', 'HH:mm:ss');
    end.add(firstStrip.end);

    const hourArrival = moment('00:00:00', 'HH:mm:ss');
    hourArrival.add(currentTime);
    hourArrival.add(durationInTraffic);

    return hourArrival.isBetween(start, end, null, '[]');
  },

  /* description */
  complianceWithZeroBandNodes: async (nodes, indexNodeSelect, nodesBandsZero, currentDate) => {
    const unfulfilledNodes = [];
    const nodeA = nodes[indexNodeSelect];
    const { hourDeparture } = nodeA.analysis;

    // TODO: hacer esto con Promise.all()
    for (let i = 0; i < nodesBandsZero.length; i += 1) {
      const nodeB = nodes[nodesBandsZero[i]];

      // eslint-disable-next-line no-await-in-loop
      const timeInTraffic = await brinksService
        .getDurationInTraffic(nodeA, nodeB, currentDate, hourDeparture);

      const hourArrival = hourDeparture.clone();
      hourArrival.add(timeInTraffic.time);

      /* si la hora de arrival es mayor a la hora final de la franja, la franja ya ha vencido */
      const expiredTimeSlot = hourArrival > nodeB.analysis.firstStrip.end;
      if (expiredTimeSlot) unfulfilledNodes.push({ expiredTimeSlot, index: nodesBandsZero[i] });
    }

    let indexNodeZero;
    /* eleccion con de nodo con mas prioridad */
    for (let i = 0; i < unfulfilledNodes.length; i += 1) {
      if (indexNodeZero === undefined) {
        indexNodeZero = unfulfilledNodes[i].index;
        continue;
      }
      const nodeZeroA = nodes[indexNodeZero];
      const nodeZeroB = nodes[unfulfilledNodes[i].index];

      // el de prioridad max urgente
      if (nodeZeroA.priority > nodeZeroB.priority) {
        indexNodeZero = unfulfilledNodes[i].index; // nodo mas prioritario
      } else if (nodeZeroA.priority === nodeZeroB.priority) { // en caso de empate de prioridad
        // se toma el de ancho de banda mas pequeña
        if (nodeZeroA.analysis.timeBandWidth >= nodeZeroB.analysis.timeBandWidth) {
          indexNodeZero = unfulfilledNodes[i].index;
        }
      }
    }
    /* fin de eleccion con de nodo con mas prioridad */

    return indexNodeZero;
  },

  /* description */
  getNodesAvailabilitys: (nodes) => {
    let count = false;
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].blocked || nodes[i].unfulfilled) continue;
      count = true;
      i = nodes.length;
    }

    return count;
  },

  /* Filtra los nodos sacando los que tienen todas las franja horarias vencidas
     y los que han sido marcados como "unfulfilled". */
  getValidNodes: (nodeRoot, nodes, unfulfilledNodes, currentTime) => {
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].blocked) continue; // nodo bloqueado
      let nodeIsInvalid = true; // nodo invalido por default

      /* se verifica que exista por lo menos una franja viva */
      for (let h = 0; h < nodes[i].attentionHour.length; h += 1) {
        const hourEnd = moment.duration(nodes[i].attentionHour[h].end);
        hourEnd.subtract(currentTime);

        /* si la franja esta vencida */
        if (hourEnd.asSeconds() < 0) {
          continue;
        }

        // hay por lo menos una franja viva
        nodeIsInvalid = false;
        break; // no necesito verificar mas por este nodo
      }

      if (nodeIsInvalid && !nodes[i].unfulfilled) {
        nodes[i].unfulfilled = { currentTime, from: nodeRoot.description };
      }

      /* ya no se puede cumplir con este nodo */
      if (nodeIsInvalid || nodes[i].unfulfilled) unfulfilledNodes.push(nodes[i]);
    }

    /* solo los nodos validos */
    return nodes.filter((node) => !node.unfulfilled);
  },
  /* selecciona el tiempo de trafico entre el nodo root y el nodo x. */
  selectTimeTrafficToNode: (node, trafficTimes) => {
    let timeInTraffic;

    // TODO: evaluar si es conveniente ir eliminando los traffic times seleccionados
    for (let i = 0; i < trafficTimes.length; i += 1) {
      if (node.description === trafficTimes[i].description) {
        timeInTraffic = trafficTimes[i].time;
        break;
      }
    }

    return timeInTraffic;
  },

  /* desbloquea los nodos dependientes de un nodo root */
  unlockDependentNodes: (nodeRoot, nodes) => {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (nodeRoot.destination === node.description) {
        delete node.blocked;
      }
    }
  },

  /* enviar a unfulfilled */
  goUnfulfilled: (node, nodeRoot, currentTime, timeInTraffic) => {
    node.unfulfilled = {
      currentTime,
      timeInTraffic,
      from: nodeRoot.description,
      hourArrival: moment.duration(currentTime + timeInTraffic),
    };
  },

  /* description */
  analyticsTheNode: (nodeRoot, node, trafficTimes, currentTime, timePerStop) => {
    // console.time('selectTimeTrafficToNode');
    const timeInTraffic = brinksService.selectTimeTrafficToNode(node, trafficTimes);
    // console.timeEnd('selectTimeTrafficToNode');

    // console.time('getFirstStrip');
    /* la franja horaria mas cercana con respecto a la hora de salida */
    const { firstStrip, numberBands } = brinksService.getFirstStrip(node, currentTime, timeInTraffic);
    // console.timeEnd('getFirstStrip');

    /* este nodo es un unfulfilled */
    if (firstStrip === undefined) {
      /* lo categoriaza con unfullfilled */
      brinksService.goUnfulfilled(node, nodeRoot, currentTime, timeInTraffic);
    } else {
      /* Cercania */
      const timeProximity = firstStrip.start.clone();
      timeProximity.subtract(currentTime);

      /* Ancho de franja horaria de atencion */
      const timeBandWidth = firstStrip.end.clone();
      timeBandWidth.subtract(firstStrip.start);

      /* si el tiempo de servicio va dentro de la franja horaria */
      if (node.serviceTimeWithin) timeBandWidth.subtract(moment.duration(node.serviceTime));

      // TODO: mejorar tiempos de getArrival
      // console.time('getArrival');
      /* llega dentro de la franja horaria? */
      const arrival = brinksService.getArrival(node, currentTime, timeInTraffic, firstStrip);
      // console.timeEnd('getArrival');

      /* tiempo de serivicio en el nodo */
      const serviceTime = moment.duration(node.serviceTime);

      /* hourBase si se llega al nodo dentro de la franja */
      let hourBase = moment.duration(currentTime + timeInTraffic);

      /* si se llega antes de la franja horaria */
      if (!arrival) hourBase = firstStrip.start.clone();

      const hourDeparture = moment.duration(hourBase + timePerStop + serviceTime);
      const hourArrival = moment.duration(currentTime + timeInTraffic);

      node.analysis = {
        firstStrip,
        timeProximity,
        timeBandWidth,
        timeInTraffic,
        arrival,
        numberBands,
        hourArrival,
        hourDeparture,
      };
    }
  },

  /* nameless */
  createRoute: async ({
    nodeRoot, nodes, hourDeparture, timePerStop, timeDeparture,
  }) => {
    nodes = JSON.stringify(nodes);
    nodes = JSON.parse(nodes);

    /* tiempo actual del recorrido */
    let currentTime = hourDeparture.clone();

    /* nodos no cumplidos */
    let unfulfilledNodes = [];

    /* nodo de inicio */
    let nodeInit = nodes.shift();

    /* ruta diseñada */
    const route = [nodeRoot];
    route.push(nodeInit);

    /* liberando los nodos del nodo seleccionado */
    brinksService.unlockDependentNodes(nodeInit, nodes);

    /* fecha actual, para api traffic */
    const currentDate = moment('00:00:00', 'HH:mm:ss');

    /* vida del cliclo do */
    let nextDo = false;

    do {
      /* separando los nodos validos de los unfulfilleds */
      nodes = brinksService.getValidNodes(nodeInit, nodes, unfulfilledNodes, currentTime);

      /* si no hay nodos disp. dejo de iterar el do */
      if (nodes.length <= 0) break;

      /* tiempos desde nodo root contra todos los nodos disponibles */
      const trafficTimes = await brinksService.getTrafficTimes(nodeInit, nodes, currentDate, currentTime);

      /* Proximo nodo seleccionado */
      let indexNodeSelect;

      /* nodes con franjas horarias en cero */
      let nodesBandsZero = [];

      for (let i = 0; i < nodes.length; i += 1) {
        /* si el nodo está bloqueado no lo analizo */
        if (nodes[i].blocked || nodes[i].unfulfilled) continue;

        /* current node */
        const node = nodes[i];

        /* analytics del node */
        brinksService.analyticsTheNode(nodeRoot, node, trafficTimes, currentTime, timePerStop);
        /* no tiene banda horaria disp. */
        if (node.unfulfilled) continue;

        /* identificando nodos de cero bandas disp */
        if (node.analysis.numberBands <= 0) nodesBandsZero.push(i);

        /* identificando el nodo mas urgente */
        if (indexNodeSelect === undefined) {
          indexNodeSelect = i;
          continue; // porque apenas se inicializa
        }

        indexNodeSelect = brinksService.selectingNodeMoreUrgent(nodes[indexNodeSelect], nodes[i], i, indexNodeSelect);
      }

      // TODO: quitar if al volver el proceso a function
      if (indexNodeSelect !== undefined) {
        /*
        * TODO: cuando evaluo si hacer el proceso de seleccion definitiva,
        * hacerlo si se cumple con los siguiente:
        * si no es el nodo de la prioridad mas baja de entre los evaluados
        * y si su numero de bandas horarias disponibles es mayor que cero
        */

        /* verificando que nodo urgente no hace incumplir con nodos de cero franjas disponibles */
        const { numberBands } = nodes[indexNodeSelect].analysis;
        // TODO: indexNodeSelect !== undefined, es innecesaria por lo visto.
        if (indexNodeSelect !== undefined && numberBands >= 1 && nodesBandsZero.length > 0) {
          nodesBandsZero = await brinksService.complianceWithZeroBandNodes(nodes, indexNodeSelect, nodesBandsZero, currentDate);

          /* seleccionando el importante, soltando al urgente */
          if (nodesBandsZero !== undefined) indexNodeSelect = nodesBandsZero;
        }

        /* seleccionando el nodo y ajustando variables */
        currentTime = nodes[indexNodeSelect].analysis.hourDeparture.clone();
        const difinitiveNode = nodes.splice(indexNodeSelect, 1);

        [nodeInit] = difinitiveNode;
        route.push(difinitiveNode[0]);

        /* fin de selección del nodo y ajustando variables */
        if (nodeInit.destination) brinksService.unlockDependentNodes(nodeInit, nodes);
      }

      nextDo = brinksService.getNodesAvailabilitys(nodes);
    } while (nextDo);

    unfulfilledNodes = unfulfilledNodes.concat(nodes);

    let totalDuration = moment.duration(0);
    if (route[route.length - 1].analysis) {
      totalDuration = moment.duration(route[route.length - 1].analysis.hourDeparture - timeDeparture);
    }

    return {
      hourDeparture: timeDeparture,
      totalDuration,
      route,
      unfulfilledNodes,
    };
  },

  selectingNodeMoreUrgent: (nodeA, nodeB, i, indexNodeSelect) => {
    const { timeProximity: timeProximityA, numberBands: numberBandsA } = nodeA.analysis;
    const { timeProximity: timeProximityB, numberBands: numberBandsB } = nodeB.analysis;
    let IndexNodeUrgent = indexNodeSelect;

    /* si el nodo A está mas lejano de la franja horaria que el B, me quedo con el B */
    if (timeProximityA.asSeconds() > timeProximityB.asSeconds()) {
      IndexNodeUrgent = i; // el nodo mas cercano a la hora de partida
    }

    /* si la cercania es igual decide el nro de franjas horarias disponibles */
    if (timeProximityA.asSeconds() === timeProximityB.asSeconds()) {
      if (numberBandsA > numberBandsB) IndexNodeUrgent = i; // el nodo de menos franjas

      if (numberBandsA === numberBandsB) {
        if (nodeA.priority >= nodeB.priority) IndexNodeUrgent = i; // el de prioridad max urgente
      }
    }

    return IndexNodeUrgent;
  },
};

module.exports = brinksService;
