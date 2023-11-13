#!/bin/bash

source scripts/utils.sh
cd_xengpuminer

MINER_COUNT=$(ps -x -o command | grep -c "python3 miner.py")
XEN_GPU_MINER_COUNT=$(ps -x -o command | grep -c "xengpuminer")

printTitle "Validate miner.py and xengpuminer process count"
printSubTitle "miner.py ($MINER_COUNT), should be greater then 1"
printSubTitle "xengpuminer ($XEN_GPU_MINER_COUNT), should be GPU count + 1"

printTitle "Running watcher locally"

python3 watch.py --local=true || printSubTitle "Error something went wrong!"

cd_project_root
