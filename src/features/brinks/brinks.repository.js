/* eslint-disable no-param-reassign */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
const moment = require('moment');
const _ = require('lodash');
const {
  getDurationInTraffic,
  getTrafficTimes,
  getValidNodes,
  createRoute,
  analyticsTheNode,
} = require('../../services/brinks.service');

const brinksRepository = {
  algorithm: async ({ nodes, timeDeparture, timePerStop }) => {
    /* hora de salida */
    timeDeparture = moment.duration(timeDeparture);
    /* tiempo por parada */
    timePerStop = moment.duration(timePerStop);
    /* tiempo actual del recorrido */
    const currentTime = timeDeparture.clone();
    /* nodos no cumplidos */
    const unfulfilledNodes = [];
    /* las diferentes rutas */
    const routes = [];
    /* nodo anterior */
    const nodeRoot = nodes.shift();
    nodes = getValidNodes(nodeRoot, nodes, unfulfilledNodes, currentTime);

    /* fecha actual, para api traffic */
    const currentDate = moment('00:00:00', 'HH:mm:ss');
    /* tiempos desde nodo root contra todos los nodos disponibles */
    const trafficTimes = await getTrafficTimes(nodeRoot, nodes, currentDate, currentTime);

    // TODO: probar caso cuando nodes se filtra y viene un array vacio
    for (let i = 0; i < nodes.length; i += 1) {
      /* si el nodo está bloqueado no lo analizo */
      if (nodes[i].blocked || nodes[i].unfulfilled) continue;

      const node = nodes[i]; // current node

      /* analytics del node */
      analyticsTheNode(nodeRoot, node, trafficTimes, currentTime, timePerStop);

      /* no tiene banda horaria disp */
      if (node.unfulfilled) continue;

      /* todos los nodos menos en actual */
      const route = nodes.filter((item) => item !== node);
      /* colocando el nodo como nodo raiz */
      route.unshift(node);

      const { hourDeparture } = node.analysis;
      routes.push(createRoute({
        nodeRoot, hourDeparture, timePerStop, timeDeparture, nodes: route,
      }));
    }

    return Promise.all(routes).then((suggestedRoutes) => {
      suggestedRoutes.forEach((node) => {
        node.unfulfilledNodes = unfulfilledNodes.concat(node.unfulfilledNodes);
      });

      /* TODO: se debe calcular el tiempo que debo esperar en cada nodo antes de llegar a mi franja
      * y ranquear tambien por sumatoria de tiempo de espera, seria: la ruta con mas nodos, menos
      * tiempo total y menor duracion de tiempo de espera.
      */
      suggestedRoutes = _.orderBy(suggestedRoutes, [
        (item) => item.route.length,
        (item) => item.totalDuration.asSeconds()
      ], ['desc', 'asc']);

      return { suggestedRoutes };
    });
  },

  /* description */
  promiseAll: async ({ body }) => {
    const { nodes, hourDeparture } = body;
    /* fecha actual, para api traffic */
    const currentDate = moment('00:00:00', 'HH:mm:ss');
    /* hora de partida */
    const currentTime = moment.duration(hourDeparture);
    /* tomo el node de orden cero, este siempre es el primero del array */
    const nodeRoot = nodes.shift();

    const promises = [];

    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].blocked) continue;
      promises.push(getDurationInTraffic(nodeRoot, nodes[i], currentDate, currentTime, i));
    }

    return Promise.all(promises)
      .then((res) => res)
      .catch((err) => console.log(err));
  },
};

module.exports = brinksRepository;
