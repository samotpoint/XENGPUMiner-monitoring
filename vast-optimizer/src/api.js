const axios = require("axios");
const config = require("./config");
const utils = require("./utils");

module.exports.fetchCurrentBalance = async () => {
  const { status, data } = await axios.get('https://console.vast.ai/api/v0/users/current', {
    headers: { Authorization: `Bearer ${ config.apiKey }` },
  })
  return data.credit
}

module.exports.fetchVastInstances = async () => {
  const { status, data = [] } = await axios.get('https://console.vast.ai/api/v0/instances', {
    headers: { Authorization: `Bearer ${ config.apiKey }` },
  })
  await utils.archiveJsonFile('instances', data, `${ Date.now() }-${ data?.length }.json`)
  return data
}

module.exports.deleteVastInstances = async (instanceId) => {
  console.log('Deleting Vast instance', instanceId)
  const { status, data } = await axios.delete(`https://console.vast.ai/api/v0/instances/${ instanceId }/`, {
    headers: { Authorization: `Bearer ${ config.apiKey }` },
  })
  await utils.archiveJsonFile('instances', data, `${ Date.now() }-${ instanceId }.json`)
  console.log('deleteVastInstances', { status, data })
}

module.exports.fetchAccountDetails = async () => {
  const { status, data } = await axios.get('https://xenblocks.app/api/accounts/details')
  return data
}
