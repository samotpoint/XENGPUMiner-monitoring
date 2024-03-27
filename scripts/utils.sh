#!/bin/bash

ROOT_DIR="$(pwd)"

printTitle() {
  sleep 0.8
  echo ""
  echo "**************************************************"
  echo "** $1"
  echo "**************************************************"
}

printSubTitle() {
  echo "** $1"
}

install_package() {
  PACKAGE_NAME="$1"
  printSubTitle "Installing $PACKAGE_NAME..."
  if ! sudo apt-get install -y "$PACKAGE_NAME" &>/dev/null; then
    printTitle "Failed to install $PACKAGE_NAME"
    exit 1
  fi
}

cd_project_root() {
  cd "$ROOT_DIR" || exit 1
}

cd_xengpuminer() {
  cd "$ROOT_DIR/XENGPUMiner" || exit 1
}

# Ensure account use following order
# 1. Look for environment variable ACCOUNT
# 2. Look for account.txt
# 3. Prompt user to enter account then save it to account.txt to be used when reinstalling
ensure_account() {
  echo "Running ensure_account"
  if [ -z ${ACCOUNT+x} ]; then
    # Environment variable ACCOUNT was NOT set
    # Use account.txt if it exist
    if [ -f "account.txt" ]; then
      ACCOUNT="$(cat account.txt)"
      printSubTitle "Using account: $ACCOUNT (from file account.txt)"
      return 1
    else
      # Prompt user to enter account
      read -p "Enter account: " ACCOUNT
    fi
  fi

  # Environment variable ACCOUNT was set
  printSubTitle "Saving account information in account.txt"
  echo "$ACCOUNT" > account.txt
}

ensure_cuda_arch() {
  echo "Running ensure_cuda_arch"
  if [ -z ${CUDA_ARCH_SM+x} ]; then
    # Environment variable CUDA_ARCH_SM was NOT set
    CUDA_ARCH_SM="sm_$(nvidia-smi -i=0 --query-gpu=compute_cap --format=csv,noheader | sed "s/\.//")"
  fi
}

ensure_vast_id() {
    echo "Running ensure_vast_id"
    if [ -z ${VAST_CONTAINERLABEL+x} ]; then
      # Environment variable VAST_CONTAINERLABEL was NOT set
      VAST_ID="$VAST_CONTAINERLABEL"
    fi
    if [ -z ${VAST_ID+x} ]; then
      # Environment variable VAST_ID was NOT set
      VAST_ID="$(cat ~/.vast_containerlabel)"
    fi
}
