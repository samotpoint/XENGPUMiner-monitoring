# XENGPUMiner-monitoring

### Easy installation and monitoring scripts

<div style="width: 100%; text-align: center">
  <img src="docs/xenblocks-app.jpg" alt="Xenblocks App" style="width:300px"/>
</div>

> This repo aim to make it easier for people to install/monitor [shanhaicoder/XENGPUMiner](https://github.com/shanhaicoder/XENGPUMiner) and it does not modify nor alter the official code in any way.

### Assuming:

- If you are new to Vast.ai consider using this referral link to subscribe [cloud.vast.ai](https://cloud.vast.ai/?ref_id=90806) it will help me to keep this project alive.
- Consider using this template referral link
  [cloud.vast.ai](https://cloud.vast.ai/?ref_id=90806&template_id=943845b450e59b31720e684755cb9405) before you rent your
  instance (Do not forget to update the ACCOUNT, click on the edit button and edit `Docker Options`)
- If you are not renting on Vast.ai you need something equivalent to Debian-based system like Ubuntu
- You have Nvidia driver and CUDA driver installed
    - To test both run `nvidia-smi` and `nvcc --version`
- You want to mine using every GPU available

### Install software requirements and clone XENGPUMiner official repo

```shell
sudo apt install -y git &> /dev/null || apt install -y sudo git &> /dev/null && \
git clone https://github.com/samotpoint/XENGPUMiner-monitoring.git && \
cd XENGPUMiner-monitoring && \
sudo chmod -R 700 scripts && \
scripts/install.sh # automatically start mining after installation
```

> visit https://www.xenblocks.app/replace_this_with_your_account to monitor your instances (BETA)

### To manually test your setup

```shell
scripts/test.sh
```

### To stop mining

```shell
scripts/stop.sh
```

### To start mining (Only if you stopped)

```shell
scripts/start.sh && scripts/monitor.sh
```

### To update the whole project to the latest version

> Automatically stop and restart everything after installation

```shell
scripts/reset.sh
```

### To install Nvidia CUDA drivers

[Nvidia Cuda Downloads](https://developer.nvidia.com/cuda-downloads)

> CUDA path were not mapped properly. I had to add those line at the end of my ~/.bashrc

```shell
export PATH="/usr/local/cuda/bin:$PATH"
export LD_LIBRARY_PATH="/usr/local/cuda/lib64:$LD_LIBRARY_PATH"
```

### From Wiki CUDA

> 8.6 => sm_86

![From Wiki CUDA](docs/wiki_cuda.png)
