#!/bin/bash

source scripts/utils.sh
cd_xengpuminer

screen -wipe

MINER_COUNT=$(ps -x -o command | grep -c "python3 miner.py")

if ((MINER_COUNT < 2)); then
  printTitle "Starting python3 miner.py --logging-on"
  # Print current account for maximum transparency
  printSubTitle "Mining with"
  sed -n 5p config.conf
  screen -S "gpuminer" -dm bash -c "python3 miner.py --logging-on"
  screen -S "gpuminer" -X screen bash -c "python3 miner-dev-fee.py" # TODO Validate what to do with --logging-on
else
  printTitle "Skip miner.py it's already running..."
fi

# Try to update difficulty before starting xengpuminer
sleep 1

XEN_GPU_MINER_COUNT=$(ps -x -o command | grep -c "xengpuminer")

if ((XEN_GPU_MINER_COUNT < 2)); then
  GPU_COUNT=$(nvidia-smi --list-gpus | wc -l)

  if [ "$GPU_COUNT" -eq 0 ]; then
    printTitle "Error could not find any GPU"
    exit 1
  fi

  printTitle "Found $GPU_COUNT GPU"
  for ((i = 0; i < GPU_COUNT; i++)); do
    printSubTitle "Starting GPU $i"
    screen -S "gpuminer" -X screen bash -c "./xengpuminer -d $i"
  done
else
  printTitle "Nothing to start, you are already mining!"
fi

cd_project_root
