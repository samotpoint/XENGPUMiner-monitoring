# XENGPUMiner-monitoring

<div style="width: 100%; text-align: center">
  <img src="docs/xenblocks-app-banner.png" alt="Xenblocks App" style="height:350px"/>
</div>

> This repo aim to make it easier for people to install/monitor [shanhaicoder/XENGPUMiner](https://github.com/shanhaicoder/XENGPUMiner) and it does not modify nor alter the official code in any way.

### Assuming:

- You are renting on Vast.ai using the `cuda:12.0.1-devel-ubuntu20.04` template or something equivalent to Debian-based
  system like Ubuntu
- You have Nvidia driver and CUDA driver installed
    - To test both run `nvidia-smi` and `nvcc --version`
- You want to mine using all GPU and 0 CPU

### Install software requirements and clone shanhaicoder/XENGPUMiner

Regarding the account used for mining every script will check in this order (see `ensure_account` in utils.sh)

1. Environment variable `ACCOUNT`
1. A file `account.txt`
1. Prompt the user to enter the account than save it to `account.txt`

```shell
sudo apt-get update &>/dev/null || apt-get update &>/dev/null && \
sudo apt-get install -y git &>/dev/null || apt-get install -y sudo git &>/dev/null && \
git clone https://github.com/samotpoint/XENGPUMiner-monitoring.git || echo "Skip cloning XENGPUMiner-monitoring" && \
cd XENGPUMiner-monitoring && \
sudo chmod -R 700 scripts && \
scripts/boot.sh
```

- Automatically start mining after installation
- Visit [xenblocks.app](https://www.xenblocks.app) to monitor your instances

### To manually test your setup

```shell
scripts/test.sh
```

### To stop mining

```shell
scripts/stop.sh
```

### To restart mining and monitoring

```shell
scripts/start.sh && scripts/monitor.sh
```

### To update the whole project to the latest version

This script will

- Automatically stop your mining/monitoring process
- Pull the latest version of both `XENGPUMiner-monitoring` and `shanhaicoder/XENGPUMiner`
- Rebuild XENGPUMiner
- Start mining using the account stored in `account.txt` (This file was saved by you during the installation)

```shell
scripts/reset.sh
```

## To support this project

Any form of donation is much appreciated and will be invested in this project.

<div style="width: 100%; text-align: center">
  <a href="https://www.buymeacoffee.com/samotpoints">
    <img alt="Buy me a coffee" src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=samotpoints&button_colour=40DCA5&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" />
  </a>
</div>

- If you are new to Vast.ai consider using this referral link to
  subscribe [cloud.vast.ai](https://cloud.vast.ai/?ref_id=90806)

## Public Docker image on Docker Hub

> This Docker image is still a work in progress, use at your own risk!

[samotpoint/xengpuminer-monitoring](https://hub.docker.com/repository/docker/samotpoint/xengpuminer-monitoring)
