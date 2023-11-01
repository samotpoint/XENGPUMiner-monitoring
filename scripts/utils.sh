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
  if [ -f "account.txt" ]; then
    ACCOUNT="$(cat account.txt)"
  else
    read -p "Enter account: " ACCOUNT
    echo "$ACCOUNT" >account.txt
  fi
}

ensure_cuda_arch() {
  if [ -f "cuda_arch.txt" ]; then
    CUDA_ARCH_SM="$(cat cuda_arch.txt)"
  else
    read -p "Enter CUDA ARCH (sm_86, sm_89...): " CUDA_ARCH_SM
    echo "$CUDA_ARCH_SM" >cuda_arch.txt
  fi
}
