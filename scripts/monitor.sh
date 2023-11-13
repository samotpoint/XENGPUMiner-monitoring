#!/bin/bash

source scripts/utils.sh
cd_xengpuminer

if ! screen -list | grep -q "watcher"; then
  printTitle "Starting Monitoring"
  printSubTitle "Starting python3 watch.py"
  screen -S "watcher" -dm bash -c "python3 watch.py"
else
  printTitle "Nothing to start, you are already monitoring!"
fi

sleep 1
if test -f "watch-worker-id.txt"; then
  printSubTitle "Worker: $(cat watch-worker-id.txt)"
else
  printSubTitle "Missing watch-worker-id.txt"
fi

account_line="$(sed '5q;d' config.conf)"
echo "visit: https://xenblocks.app/${account_line:10:52}"

cd_project_root
