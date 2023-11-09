FROM nvidia/cuda:12.0.1-devel-ubuntu20.04

ARG DEBIAN_FRONTEND=noninteractive

ENV DEBIAN_FRONTEND=noninteractive
ENV IS_DOCKER_BUILD=true
ENV CUDA_ARCH_SM=sm_86
ENV ACCOUNT=0x22dE03d0f29eFb1fCF01e47EF74DcC4008928BA2

RUN apt update
RUN apt install -y sudo git tzdata build-essential openssh-server
RUN mkdir -p /run/sshd

WORKDIR /XENGPUMiner-monitoring

COPY . .

RUN sudo chmod -R 700 scripts
RUN scripts/install.sh

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D", "&&", "scripts/start.sh", "&&", "scripts/monitor.sh"]
