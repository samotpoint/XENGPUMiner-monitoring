require('dotenv').config()

const axios = require('axios')
const { printTable } = require('console-table-printer')

const apiKey = process.env.VAST_AI_API_KEY
if (!apiKey) {
  console.error('Missing Vast AI API Key')
  process.exit(1)
}

const dateToRuntime = (value) => {
  const date = new Date(value)
  value = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (value < 60) {
    return `${ value } seconds`
  }

  const minutes = Math.floor(value / 60)
  const minutesToDisplay = `${ minutes % 60 }`.padStart(2, '0')
  const hours = Math.floor(minutes / 60)
  const hoursToDisplay = hours % 24
  const days = Math.floor(hours / 24)

  if (!hours) {
    return `${ parseInt(minutesToDisplay) } min`
  }

  if (!days) {
    return `${ hoursToDisplay }h ${ minutesToDisplay }`
  }

  return `${ days } days, ${ hoursToDisplay }:${ minutesToDisplay }`
}

const formatDuration = (value) => {
  if (value < 60) {
    return `${ value } seconds`
  }

  const minutes = Math.floor(value / 60)
  const minutesToDisplay = `${ minutes % 60 }`.padStart(2, '0')
  const hours = Math.floor(minutes / 60)
  const hoursToDisplay = `${ hours % 24 }`.padStart(2, '0')
  const days = Math.floor(hours / 24)

  if (!hours) {
    return `${ minutesToDisplay } minutes`
  }

  if (!days) {
    return `${ hoursToDisplay }:${ minutesToDisplay }`
  }

  return `${ days } days, ${ hoursToDisplay }:${ minutesToDisplay }`
}

const arraySum = (nums = []) => nums.reduce((total, num) => total + num, 0)

const fetchCurrentBalance = async () => {
  const { status, data } = await axios.get('https://console.vast.ai/api/v0/users/current', {
    headers: { Authorization: `Bearer ${ apiKey }` },
  })
  return data.credit
}

const fetchVastInstances = async () => {
  const { status, data } = await axios.get('https://console.vast.ai/api/v0/instances', {
    headers: { Authorization: `Bearer ${ apiKey }` },
  })
  return data
}

const deleteVastInstances = async (instanceId) => {
  console.log('Deleting Vast instance', instanceId)
  const { status, data } = await axios.delete(`https://console.vast.ai/api/v0/instances/${ instanceId }/`, {
    headers: { Authorization: `Bearer ${ apiKey }` },
  })
  console.log('deleteVastInstances', { status, data })
}

const fetchAccountDetails = async () => {
  const { status, data } = await axios.get('https://xenblocks.app/api/accounts/details')
  return data
}

const main = async () => {
  console.clear()

  const balance = await fetchCurrentBalance()
  const { instances: vastInstances } = await fetchVastInstances()
  const { workers } = await fetchAccountDetails()

  let bestPerformanceRatio = -1
  let avgPerformance = {
    '$/kH': 0,
    'H/$': 0,
    count: 0,
  }

  const items = vastInstances.map((vastInstance) => {
    const worker = workers.find(({ vastData }) => vastData?.includes(vastInstance.id))
    const {
      HASH_RATES = [],
      DIFFICULTY = '-',
      BLOCKS_FOUND_COUNT = 0,
      BLOCKS_XUNI = 0,
      BLOCKS_XENBLOCK = 0,
      BLOCKS_SUPER = 0,
    } = worker?.data || {}

    const totalKiloHash = parseFloat((arraySum(HASH_RATES.map((h) => parseInt(h))) / 1000).toFixed(3))

    const performanceRatio = totalKiloHash ? vastInstance.dph_total / totalKiloHash : 0
    if (bestPerformanceRatio === -1 && performanceRatio) {
      bestPerformanceRatio = performanceRatio
    }

    let hashPerUSD = 0
    if (performanceRatio) {
      hashPerUSD = totalKiloHash * 1000 / (vastInstance.dph_total * 60 * 60)
      bestPerformanceRatio = Math.min(bestPerformanceRatio, performanceRatio)
      avgPerformance['$/kH'] += performanceRatio
      avgPerformance['H/$'] += hashPerUSD
      avgPerformance.count++
    }

    vastInstance.totalKiloHash = totalKiloHash

    const date = new Date(vastInstance.start_date * 1000)
    const durationInHour = (new Date().getTime() - date.getTime()) / 1000 / 60 / 60
    const runtimeCost = vastInstance.dph_total * durationInHour

    return {
      '#': '',
      'VAST ID': vastInstance.id,
      // CPU: vastInstance.cpu_arch,
      GPU: `${ vastInstance.gpu_name } x ${ vastInstance.num_gpus }/${ vastInstance.num_gpus }`,

      Difficulty: DIFFICULTY,
      // Reliability: (vastInstance.reliability2).toFixed(2),
      State: vastInstance.cur_state,
      'Runtime': dateToRuntime(vastInstance.start_date * 1000),
      // 'Runtime $': (runtimeCost).toFixed(2),
      'Min. Bid': vastInstance.is_bid ? (vastInstance.min_bid).toFixed(2) : 'N/A',
      // '$/d': (vastInstance.dph_total * 24).toFixed(2),
      '$/h': (vastInstance.dph_total).toFixed(2),
      'Total (kH/s)': totalKiloHash ? totalKiloHash : '-',
      'Perf. %': performanceRatio,
      '$/kH': performanceRatio ? (performanceRatio).toFixed(3) : '-',
      'H/$': hashPerUSD ? (hashPerUSD).toFixed(3) : '-',
      // GPU: `${ vastInstance.gpu_name } x ${ vastInstance.num_gpus }/${ (1 / vastInstance.gpu_frac) * vastInstance.num_gpus }`,
      '$/GPU': (vastInstance.dph_total / vastInstance.num_gpus).toFixed(2),
      'GPU (kH/s)': totalKiloHash ? (totalKiloHash / vastInstance.num_gpus).toFixed(3) : '-',
      'Blocks': BLOCKS_FOUND_COUNT ? BLOCKS_FOUND_COUNT : '-',
      '$/Blocks': BLOCKS_FOUND_COUNT ? (runtimeCost / BLOCKS_FOUND_COUNT).toFixed(2) : '-',
      '$/XNM': BLOCKS_XENBLOCK ? (runtimeCost / (BLOCKS_XENBLOCK * 10)).toFixed(2) : '-',
      '$/X.BLK': BLOCKS_SUPER ? (runtimeCost / BLOCKS_SUPER).toFixed(2) : '-',
      '$/XUNI': BLOCKS_XUNI ? (runtimeCost / BLOCKS_XUNI).toFixed(2) : '-',
    }
  })

  avgPerformance['$/kH'] = avgPerformance['$/kH'] / avgPerformance.count
  avgPerformance['H/$'] = avgPerformance['H/$'] / avgPerformance.count

  items
    .sort((a, b) => {
      if (!a['Perf. %']) {
        return 1
      }
      if (!b['Perf. %']) {
        return -1
      }
      return a['Perf. %'] - b['Perf. %']
    })
    .forEach((item, index) => {
      item['#'] = index + 1
      const perf = item['Perf. %']
      item['Perf. %'] = bestPerformanceRatio === -1 ? 'N/A' : perf ? (bestPerformanceRatio / perf * 100).toFixed(1) : '-'
    })

  let stats = { costPerHour: 0, totalKiloHash: 0 }
  stats = vastInstances.reduce(
    (stats, vastInstance) => {
      stats.costPerHour += vastInstance.dph_total
      stats.totalKiloHash += vastInstance.totalKiloHash
      return stats
    }, stats
  )

  printTable([
    {
      'Balance $': (balance).toFixed(2),
      'Cost $/h': (stats.costPerHour).toFixed(2),
      '$/d': (stats.costPerHour * 24).toFixed(2),
      'Remaining Time': formatDuration(balance / stats.costPerHour * 60 * 60),
      'Worker': items.length,
      'AVG $/kH': (avgPerformance['$/kH']).toFixed(3),
      'AVG H/$': (avgPerformance['H/$']).toFixed(3),
      'Total (kH/s)': (stats.totalKiloHash).toFixed(3),
    },
  ])

  printTable(items)
  console.log('Updated At:', new Date().toLocaleTimeString())
}

const removeStoppedInstances = async () => {
  const { instances: vastInstances } = await fetchVastInstances()
  vastInstances.map(async vastInstance => {
    if (!vastInstance.is_bid) {
      return
    }
    console.log(`Bid instance: ${ vastInstance.id }, state: ${ vastInstance.cur_state } `)
    if (vastInstance.cur_state !== 'running' && vastInstance.is_bid) {
      await deleteVastInstances(vastInstance.id)
    }
  })
}

main().catch((e) => console.error(e))
removeStoppedInstances().catch((e) => console.error(e))
setInterval(() => main().catch((e) => console.error(e)), 1000 * 60 * 15)
setInterval(() => removeStoppedInstances().catch((e) => console.error(e)), 1000 * 60 * 5)
