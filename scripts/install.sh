#!/bin/bash

source scripts/utils.sh
cd_project_root

printSubTitle "Installing software requirements and cloning XENGPUMiner official repo"

# Ensure Account and CUDA Arch
ensure_account
ensure_cuda_arch

printSubTitle "Current account: $ACCOUNT"
printSubTitle "Current ARCH: $CUDA_ARCH_SM"

printSubTitle "Starting in 2 seconds (To cancel: ctrl+c)"
sleep 2

#printTitle "Updating package list..."
#if ! sudo apt update; then
#  printTitle "Failed to update package list"
#  exit 1
#fi

install_package "python3"
install_package "python3-pip"
install_package "cmake"
install_package "make"
install_package "ocl-icd-opencl-dev"
install_package "screen"
install_package "nano"

if [ ! -d "XENGPUMiner" ]; then
  printTitle "Cloning XENGPUMiner official repo"
  git clone https://github.com/shanhaicoder/XENGPUMiner.git
  cp watch.py XENGPUMiner/watch.py &>/dev/null
fi

cd_xengpuminer
git remote -v

printTitle "Building xengpuminer (could take a few minutes)"
rm -rf build &>/dev/null
rm xengpuminer &>/dev/null

sudo chmod +x build.sh xengpuminer &>/dev/null
./build.sh -cuda_arch ${CUDA_ARCH_SM} &>/dev/null
sudo chmod +x xengpuminer xengpuminer &>/dev/null

printTitle "Installing requirements.txt (could take a few minutes)"
pip3 install -U -r requirements.txt &>/dev/null

printTitle "Updating config.conf with $ACCOUNT"
sed -i "s/account = 0x24691e54afafe2416a8252097c9ca67557271475/account = $ACCOUNT/g" config.conf
printSubTitle "Current config: $(sed -n 5p config.conf)"

cd_project_root

printTitle "Installation completed!"

# Start mining and monitoring
scripts/start.sh && scripts/monitor.sh
