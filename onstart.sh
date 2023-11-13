#!/bin/bash

cd /root/XENGPUMiner-monitoring || exit

source scripts/utils.sh

printTitle "Validating Vast.ai requirements"

if [ -z ${ACCOUNT+x} ]; then
  printSubTitle "Error: missing environment variable 'ACCOUNT' during onstart.sh"
  printSubTitle "Before using this template use the edit button and update 'Docker Options' accordingly"
  printSubTitle "Example:"
  echo '-e ACCOUNT="replace_this_with_your_account"'
  printSubTitle "Warning this instance wont be mining!"
  printSubTitle "To start mining"
  printSubTitle "Option 1. Delete this instance, update the template and rent a new instance"
  printSubTitle "Option 2. SSH in this instance, run:"
  echo "cd /root/XENGPUMiner-monitoring && ./scripts/install.sh"
  printSubTitle "At some point during the installation you will be prompt to enter your account."
  printSubTitle "Now exiting!"
  exit 1
fi

./scripts/boot.sh
