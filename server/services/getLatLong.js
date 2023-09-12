const getLatLonFromZip = require("./locationIQ");

async function getLatLong(zip) {
  const coordinates = await getLatLonFromZip(zip);
  return coordinates;
}

module.exports = { getLatLong };
