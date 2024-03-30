const apiKey = process.env.VAST_AI_API_KEY
if (!apiKey) {
  console.error('Missing Vast AI API Key')
  process.exit(1)
}

module.exports.apiKey = apiKey

// Interval to refresh tables should not be lower than 15 minutes
module.exports.refreshTableIntervalInMS = 1000 * 60 * 15

// Interval to try and delete stopped instances and should not be lower than 3 minutes, to disable this feature set it to 0
module.exports.autoDeleteInstancesIntervalInMS = 1000 * 60 * 5

module.exports.rules = {
  instanceStatus: {
    cur_state: ['running'], // Any state not included in this array will trigger the destroy instance function.
  },
  // dollarPerKiloHash: {
  //   enabled: true,
  //   value: [
  //     { value: 90000, '$/kH': 0.15 },
  //     { value: 100000, '$/kH': 0.20 },
  //     { value: 110000, '$/kH': 0.30 },
  //     { value: 120000, '$/kH': 0.35 },
  //     { value: 130000, '$/kH': 0.40 },
  //   ],
  // },
}
