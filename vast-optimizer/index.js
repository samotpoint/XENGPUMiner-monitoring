require('dotenv').config()
const { printTable } = require('console-table-printer')

const config = require('./src/config')
const api = require('./src/api')
const utils = require('./src/utils')

const state = {
  balance: null,
  vastInstances: null,
  workers: null,
}

const refreshState = async () => {
  state.balance = await api.fetchCurrentBalance()
  state.vastInstances = (await api.fetchVastInstances())?.instances || []
  state.workers = (await api.fetchAccountDetails())?.workers || []
}

const renderTable = async () => {
  await refreshState()

  const stoppedInstances = state.vastInstances.filter((item) => item.cur_state !== 'running').map((vastInstance) => {
    const worker = state.workers.find(({ vastData }) => vastData?.includes(vastInstance.id))
    return utils.mapVastInstanceToInstances(vastInstance, worker)
  })
  utils.sortInstancesByPerformanceRation(stoppedInstances)

  const runningInstances = state.vastInstances.filter((item) => item.cur_state === 'running').map((vastInstance) => {
    const worker = state.workers.find(({ vastData }) => vastData?.includes(vastInstance.id))
    return utils.mapVastInstanceToInstances(vastInstance, worker)
  })

  const globalStats = utils.calculateGlobalStats(runningInstances)
  const stats = { costPerHour: 0, kiloHashTotal: 0 }
  runningInstances.forEach((item) => {
    stats.costPerHour += item.rawData.dph_total
    stats.kiloHashTotal += item.rawData.kiloHashTotal
  })

  utils.sortInstancesByPerformanceRation(runningInstances)
  runningInstances
    .forEach((item, index) => {
      const { usdPerHash } = item.rawData
      item['#'] = index + 1
      if (globalStats.bestPerformanceRatio === -1) {
        item['Perf. %'] = 'N/A'
      } else if (usdPerHash) {
        item['Perf. %'] = (globalStats.bestPerformanceRatio / usdPerHash * 100).toFixed(1)
      } else {
        item['Perf. %'] = '-'
      }

      delete item.rawData
    })

  console.clear() // Clear console before printing tables
  await utils.logAndSaveTable('global', [
    {
      'Balance $': (state.balance).toFixed(2),
      'Cost $/h': (stats.costPerHour).toFixed(2),
      '$/d': (stats.costPerHour * 24).toFixed(2),
      'Remaining Time': utils.formatDuration(state.balance / stats.costPerHour * 60 * 60),
      'Worker': `${ runningInstances.length }/${ runningInstances.length + stoppedInstances.length }`,
      'AVG $/kH': (globalStats['$/kH']).toFixed(3),
      'AVG H/$': (globalStats['H/$']).toFixed(3),
      'Total (kH/s)': (stats.kiloHashTotal).toFixed(3),
    },
  ])

  await utils.logAndSaveTable('running', runningInstances)

  if (stoppedInstances.length) {
    stoppedInstances.forEach((stoppedInstance, index) => {
      stoppedInstance['#'] = index
      delete stoppedInstance.Difficulty
      delete stoppedInstance['Total (kH/s)']
      delete stoppedInstance['Perf. %']
      delete stoppedInstance['$/kH']
      delete stoppedInstance['H/$']
      delete stoppedInstance['GPU (kH/s)']
      delete stoppedInstance['Blocks']
      delete stoppedInstance['$/Blocks']
      delete stoppedInstance['$/XNM']
      delete stoppedInstance['$/X.BLK']
      delete stoppedInstance['$/XUNI']
      delete stoppedInstance.rawData
    })
    await utils.logAndSaveTable('stopped', stoppedInstances)
  }

  console.log('Updated At:', new Date().toLocaleTimeString())
}

const removeBidInstancesStoppedOrFaulty = async () => {
  const { instances: vastInstances } = await api.fetchVastInstances()
  vastInstances.filter(({ is_bid }) => is_bid).map(({ id, cur_state }) => {
    console.log(`Bid instance: ${ id }, state: ${ cur_state } `)
  })

  const instanceToBeDeleted = []
  vastInstances.filter(({ status_msg, cur_state }) => {
    return status_msg?.includes('Error response from daemon') || cur_state !== 'running'
  }).forEach(({ id }) => instanceToBeDeleted.push(id))

  const promises = instanceToBeDeleted.map((id) => api.deleteVastInstances(id))
  await Promise.allSettled(promises)
}

// TODO use cron instead
const main = async () => {
  console.log('config.refreshTableIntervalInMS', config.refreshTableIntervalInMS)
  if (config.refreshTableIntervalInMS) {
    await renderTable().catch((e) => console.error(e))
    setInterval(() => renderTable().catch((e) => console.error(e)), config.refreshTableIntervalInMS)
  }
  console.log('config.autoDeleteInstancesIntervalInMS', config.autoDeleteInstancesIntervalInMS)
  if (config.autoDeleteInstancesIntervalInMS) {
    await removeBidInstancesStoppedOrFaulty().catch((e) => console.error(e))
    setInterval(() => removeBidInstancesStoppedOrFaulty().catch((e) => console.error(e)), config.autoDeleteInstancesIntervalInMS)
  }
}

main()
