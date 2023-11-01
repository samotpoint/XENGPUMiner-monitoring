#!/bin/bash

source scripts/utils.sh

printTitle "Stopping python3 miner.py and xengpuminer"
screen -S gpuminer -X quit &>/dev/null

printTitle "Stopping watcher"
screen -S watcher -X quit &>/dev/null

screen -ls
