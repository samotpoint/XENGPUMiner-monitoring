#!/bin/bash

source scripts/utils.sh
cd_project_root

printTitle "You are about to delete every changes that were made in this project and install everything!"

ensure_account
ensure_cuda_arch

printSubTitle "Account and CUDA Arch to be used during installation"
printSubTitle "From account.txt and cuda_arch.txt (Update accordingly before proceeding)"
printSubTitle "$ACCOUNT"
printSubTitle "$CUDA_ARCH_SM"

read -p "Continue (y/n)?" CONT
if [ "$CONT" = "y" ]; then
  scripts/stop.sh
  git reset --hard
  printSubTitle "Deleting XENGPUMiner"
  rm -rf XENGPUMiner
  printSubTitle "Updating XENGPUMiner-monitoring"
  git pull origin main
  sudo chmod -R 700 scripts
  printSubTitle "Installing and starting miner/monitoring applications"
  scripts/install.sh && scripts/start.sh && scripts/monitor.sh
  printSubTitle "Reset completed!"
  printSubTitle "To manually test run:"
  echo "scripts/test.sh"
else
  echo "Canceled"
  exit 1
fi
