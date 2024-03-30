const { printTable } = require("console-table-printer");
const fs = require("fs-extra");
const path = require("path");
const arraySum = (nums = []) => nums.reduce((total, num) => total + num, 0)

module.exports.arraySum = arraySum

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

module.exports.formatDuration = formatDuration

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

module.exports.dateToRuntime = dateToRuntime

const mapTotalKiloHashFromWorker = (hashRates = []) => parseFloat((arraySum((hashRates).map((h) => parseInt(h))) / 1000).toFixed(3))

module.exports.mapTotalKiloHashFromWorker = mapTotalKiloHashFromWorker

module.exports.mapVastInstanceToInstances = (vastInstance, worker) => {
  const {
    id,
    is_bid,
    min_bid,
    dph_total, // $/h
    cpu_arch,
    gpu_name,
    num_gpus,
    cur_state,
    start_date,
    reliability2,
  } = vastInstance

  const {
    DIFFICULTY = '-',
    HASH_RATES = [],
    BLOCKS_FOUND_COUNT = 0,
    BLOCKS_XUNI = 0,
    BLOCKS_XENBLOCK = 0,
    BLOCKS_SUPER = 0,
  } = worker?.data || {}

  const date = new Date(start_date * 1000)
  const durationInHour = (new Date().getTime() - date.getTime()) / 1000 / 60 / 60
  const dpsTotal = dph_total * 60 * 60 // $/second
  const kiloHashTotal = mapTotalKiloHashFromWorker(HASH_RATES)
  const runtimeCost = dph_total * durationInHour
  const usdPerHash = kiloHashTotal ? dph_total / kiloHashTotal : 0
  const hashPerUSD = kiloHashTotal ? kiloHashTotal * 1000 / dpsTotal : 0

  return {
    '#': 'KNOWN AFTER SORTING',
    'VAST ID': id,
    GPU: `${ gpu_name } x ${ num_gpus }/${ num_gpus }`,
    Difficulty: DIFFICULTY,
    State: cur_state,
    'Runtime': dateToRuntime(start_date * 1000),
    // 'Runtime $': (runtimeCost).toFixed(2),
    'Min. Bid': is_bid ? (min_bid).toFixed(2) : '-',
    // '$/d': (dph_total * 24).toFixed(2),
    '$/h': (dph_total).toFixed(2),
    'Total (kH/s)': kiloHashTotal ? kiloHashTotal : '-',
    'Perf. %': 'KNOWN AFTER CALCULATION',
    '$/kH': usdPerHash ? (usdPerHash).toFixed(3) : '-',
    'H/$': hashPerUSD ? (hashPerUSD).toFixed(3) : '-',
    // GPU: `${ gpu_name } x ${ num_gpus }/${ (1 / gpu_frac) * num_gpus }`,
    '$/GPU': (dph_total / num_gpus).toFixed(2),
    'GPU (kH/s)': kiloHashTotal ? (kiloHashTotal / num_gpus).toFixed(3) : '-',
    'Blocks': BLOCKS_FOUND_COUNT ? BLOCKS_FOUND_COUNT : '-',
    '$/Blocks': BLOCKS_FOUND_COUNT ? (runtimeCost / BLOCKS_FOUND_COUNT).toFixed(2) : '-',
    '$/XNM': BLOCKS_XENBLOCK ? (runtimeCost / (BLOCKS_XENBLOCK * 10)).toFixed(2) : '-',
    '$/X.BLK': BLOCKS_SUPER ? (runtimeCost / BLOCKS_SUPER).toFixed(2) : '-',
    '$/XUNI': BLOCKS_XUNI ? (runtimeCost / BLOCKS_XUNI).toFixed(2) : '-',
    rawData: {
      cur_state,
      dph_total,
      durationInHour,
      kiloHashTotal,
      usdPerHash,
      hashPerUSD,
    }
  }
}

module.exports.calculateGlobalStats = (items, workers) => {
  const globalStats = {
    '$/kH': 0,
    'H/$': 0,
    count: 0,
  }
  let bestPerformanceRatio = -1

  items.filter((item) => item.rawData.cur_state === 'running').forEach(item => {
    const { usdPerHash, hashPerUSD } = item.rawData

    if (bestPerformanceRatio === -1 && usdPerHash) {
      bestPerformanceRatio = usdPerHash
    }

    if (usdPerHash) {
      globalStats.count++
      globalStats['H/$'] += hashPerUSD
      globalStats['$/kH'] += usdPerHash
      bestPerformanceRatio = Math.min(bestPerformanceRatio, usdPerHash)
    }
  })

  globalStats['$/kH'] = globalStats['$/kH'] / globalStats.count
  globalStats['H/$'] = globalStats['H/$'] / globalStats.count

  return { ...globalStats, bestPerformanceRatio }
}

module.exports.sortInstancesByPerformanceRation = (instances = []) => {
  instances.sort((a, b) => {
    if (!a.rawData.usdPerHash) {
      return 1
    }
    if (!b.rawData.usdPerHash) {
      return -1
    }
    return a.rawData.usdPerHash - b.rawData.usdPerHash
  })
}

const archiveJsonFile = async (type, data, name = `${ Date.now() }.json`) => {
  await fs.outputJson(path.join(__dirname, '../..', 'archive', 'type', name), data, { spaces: 2 }).catch(console.error)
}

module.exports.archiveJsonFile = archiveJsonFile

module.exports.logAndSaveTable = async (type, tableData) => {
  printTable(tableData)
  return archiveJsonFile(type, tableData, `${ Date.now() }.json`)
}
