#!/bin/bash

source scripts/utils.sh
cd_xengpuminer

#ps -x -o command | grep -x "python3 miner.py" -eq "python3 miner.py --logging-on"

if ! screen -list | grep -q "gpuminer"; then
  printTitle "Starting python3 miner.py --logging-on"
  screen -S "gpuminer" -dm bash -c "python3 miner.py --logging-on"

  sed -n 5p config.conf

  GPU_COUNT=$(nvidia-smi --list-gpus | wc -l)

  if [ $GPU_COUNT -eq 0 ]; then
    printTitle "Error could not find any GPU"
    exit 1
  fi

  printTitle "Found $GPU_COUNT GPU"
  for ((i = 0; i < $GPU_COUNT; i++)); do
    printSubTitle "Starting GPU $i"
    screen -S "gpuminer" -X screen bash -c "./xengpuminer -d $i"
  done
else
  printTitle "Nothing to start, you are already mining!"
fi

cd_project_root
