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
  if ! sudo apt install -y "$PACKAGE_NAME" &>/dev/null; then
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

ensure_account() {
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
  CUDA_ARCH_SM="sm_$(nvidia-smi -i=0 --query-gpu=compute_cap --format=csv,noheader | sed "s/\.//")"
}
