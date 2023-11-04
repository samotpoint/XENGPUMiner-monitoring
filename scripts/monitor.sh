#!/bin/bash

source scripts/utils.sh
cd_xengpuminer

if ! screen -list | grep -q "watcher"; then
  printTitle "Starting python3 watch.py"
  screen -S "watcher" -dm bash -c "python3 watch.py"
else
  printTitle "Nothing to start, you are already monitoring!"
fi

sleep 1
printSubTitle "Worker: $(cat watch-worker-id.txt)"

account_line="$(sed '5q;d' config.conf)"
echo "visit: https://xenblocks.app/${account_line:10:52}"

cd_project_root
