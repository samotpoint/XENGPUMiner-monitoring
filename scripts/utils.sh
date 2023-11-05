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
  # Look for argument -a and set ACCOUNT
  if [ $# -eq 0 ]; then
    while [[ "$#" -gt 0 ]]; do
        case $1 in
            -a) ACCOUNT="$2"; shift ;;
        esac
        shift
        echo "$ACCOUNT" >account.txt
        return 1
    done
  fi

  if [ -f "account.txt" ]; then
    ACCOUNT="$(cat account.txt)"
  else
    read -p "Enter account: " ACCOUNT
    echo "$ACCOUNT" >account.txt
  fi
}

ensure_cuda_arch() {
  CUDA_ARCH_SM="sm_$(nvidia-smi -i=0 --query-gpu=compute_cap --format=csv,noheader | sed "s/\.//")"
}
