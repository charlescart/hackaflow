export const timeDifference = (givenTime) => {
  if (givenTime == '') {
    return givenTime;
  }
  givenTime = new Date(+givenTime);
  const milliseconds = new Date().getTime() - givenTime.getTime();
  const numberEnding = number => {
    return number > 1 ? 's' : '';
  };
  const number = num => num > 9 ? '' + num : '0' + num;
  const getTime = () => {
    let temp = Math.floor(milliseconds / 1000);
    const years = Math.floor(temp / 31536000);
    if (years) {
      const month = number(givenTime.getUTCMonth() + 1);
      const day = number(givenTime.getUTCDate());
      const year = givenTime.getUTCFullYear() % 100;
      return `${day}-${month}-${year}`;
    }
    const days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
      if (days < 28) {
        return days + ' dia' + numberEnding(days);
      } else {
        const months = [
          'Ene',
          'Feb',
          'Mar',
          'Abr',
          'May',
          'Jun',
          'Jul',
          'Ago',
          'Sep',
          'Oct',
          'Nov',
          'Dic',
        ];
        const month = months[givenTime.getUTCMonth()];
        const day = number(givenTime.getUTCDate());
        return `${day} ${month}`;
      }
    }
    const hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
      return `hace ${hours} hora${numberEnding(hours)}`;
    }
    const minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
      return `hace ${minutes} minuto${numberEnding(minutes)}`;
    }
    return 'hace unos segundos';
  };
  return getTime();
}


export const getDateToString = (timestamp) => {
  var dateToParse = new Date(+timestamp);

  var year = dateToParse.getFullYear().toString();
  var month = ((dateToParse.getMonth() + 1).toString()).length === 1 ? '0' + (dateToParse.getMonth() + 1).toString() : (dateToParse.getMonth() + 1);
  var day = (dateToParse.getDate().toString()).length === 1 ? '0' + dateToParse.getDate().toString() : dateToParse.getDate().toString();
  var date = day + "/" + month + "/" + year;

  return date;
}

export const getTime = (dateTimeToParse) => {
  var dateTimeToParse = new Date(+dateTimeToParse);

  var hour = dateTimeToParse.getHours().toString().length === 1 ? "0" + dateTimeToParse.getHours().toString() : dateTimeToParse.getHours().toString();
  var minutes = dateTimeToParse.getMinutes().toString().length === 1 ? "0" + dateTimeToParse.getMinutes().toString() : dateTimeToParse.getMinutes().toString();
  var time = hour + ":" + minutes + " Hs.";
  return time;
}

export const getDateWithFormat = () => {
  const today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  return dd + '.' + mm + '.' + yyyy;
}

export const getCurrentTime = () => {
  const now = new Date();
  return now.getHours() + ":" + now.getMinutes()
}

export const getActualMonth = () => {
  const current_date = new Date();
  var current_month = current_date.getMonth() + 1;

  if (current_month < 10) {
    current_month = '0' + current_month;
  }
  return current_month.toString() + current_date.getFullYear().toString();
}
