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

validate_vast_requirements() {
  printTitle "Validating Vast.ai requirements"
  if [ -z ${ACCOUNT+x} ]; then
    # Environment variable ACCOUNT was NOT set
    if [ -z ${IS_VAST_AI_ON_START+x} ]; then
      # At this point we assume the user is connected (SSH) to Vast.ai instance
      printSubTitle "Warning: missing environment variable 'ACCOUNT'"
      ensure_account
    else
      printSubTitle "Error: missing environment variable 'ACCOUNT' during onstart.sh from Vast.ai template"
      printSubTitle "Before using this template use the edit button and update 'Docker Options' accordingly:"
      echo '-e ACCOUNT="replace_this_with_your_account"'
      printSubTitle "Now exiting installation process before completion."
    fi
  fi
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
