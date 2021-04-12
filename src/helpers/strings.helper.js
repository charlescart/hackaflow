const addCommas = (nStr) => {
  nStr += "";
  var x = nStr.split(".");
  var x1 = x[0];
  var x2 = x.length > 1 ? "." + x[1] : "";
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + "," + "$2");
  }
  return x1 + x2;
}

const toTitleCase = (str) => {
  return str.split(/\s+/).map(s => s.charAt(0).toUpperCase() + s.substring(1).toLowerCase()).join(" ");
}

const createUsername = (name, lastname) => {
  let username = name.trim().substring(0, 4) + "_" + lastname.trim().substring(0, 4) + "_" + Math.floor(Math.random() * 100000);

  return username.toLowerCase();
}

module.exports = {
  addCommas,
  toTitleCase,
  createUsername
}