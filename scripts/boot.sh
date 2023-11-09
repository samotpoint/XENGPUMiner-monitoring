#!/bin/bash

source scripts/utils.sh
cd_project_root

scripts/install.sh
scripts/start.sh && scripts/monitor.sh
