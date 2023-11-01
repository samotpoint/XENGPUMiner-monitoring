#!/bin/bash

source scripts/utils.sh
cd_xengpuminer

printTitle "Running watcher locally"

python3 watch.py --local=true || printSubTitle "Error something went wrong!"

cd_project_root
