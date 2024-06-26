#!/bin/bash

source scripts/utils.sh
cd_project_root

printSubTitle "Installing software requirements and cloning XENGPUMiner official xenblocks.app repo"

# Ensure Account and CUDA Arch
ensure_account
ensure_cuda_arch

printSubTitle "Current account: $ACCOUNT"
printSubTitle "Current ARCH: $CUDA_ARCH_SM"

printSubTitle "Reporting to xenblocks.app that a worker is booting"

# Ensure wget is installed
install_package "wget"

ensure_vast_id
printSubTitle "VAST_ID: $VAST_ID (only relevant for Vast.ai users)"

GPU_DATA=$(nvidia-smi -i=0 --query-gpu=name,uuid --format=csv,noheader)
wget --quiet \
  --method POST \
  --header 'content-type: application/json' \
  --body-data "{\"ACCOUNT\":\"$ACCOUNT\",\"GPU_DATA\":\"$GPU_DATA\",\"VAST_ID\":\"$VAST_ID\"}" \
  --output-document \
  - "https://xenblocks.app/api/booting/account/$ACCOUNT"

install_package "python3"
install_package "python3-pip"
install_package "cmake"
install_package "make"
install_package "ocl-icd-opencl-dev"
install_package "screen"
install_package "nano"

if [ ! -d "XENGPUMiner" ]; then
  printTitle "Cloning XENGPUMiner official xenblocks.app repo"
  git clone https://github.com/samotpoint/XENGPUMiner.git || echo "Skip cloning samotpoint/XENGPUMiner.git"
  cp watch.py XENGPUMiner/watch.py &>/dev/null || echo "Skip cp watch.py"
fi

cd_xengpuminer
git remote -v

printTitle "Building xengpuminer (could take a few minutes)"
rm -rf build &>/dev/null
rm xengpuminer &>/dev/null

sudo chmod +x build.sh &>/dev/null
./build.sh -cuda_arch "$CUDA_ARCH_SM" &>/dev/null
sudo chmod +x xengpuminer &>/dev/null

printTitle "Installing requirements.txt (could take a few minutes)"
pip3 install -U -r requirements.txt &>/dev/null

printTitle "Updating config.conf with $ACCOUNT"
sed -i "s/account = 0x24691e54afafe2416a8252097c9ca67557271475/account = $ACCOUNT/g" config.conf || echo "Skip sed account"
printSubTitle "Current config: $(sed -n 5p config.conf)"

printTitle "Installation completed!"

cat > ./vast-data.txt << EOL
${VAST_CONTAINERLABEL}
${CONTAINER_ID}
EOL

# Ensure difficulty will start with at least 100k
echo "100000" > ./difficulty.txt

cd_project_root
