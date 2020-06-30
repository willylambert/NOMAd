FROM ubuntu:18.04

MAINTAINER ODO-VIA

RUN apt-get update && apt-get install -y cmake build-essential python3-dev python-pip

RUN pip install mip

## Mount the src directories in the container
ADD src/optim /opt/nomad/src

## Enable the execution of the start script
RUN chmod +x /opt/nomad/src/build.sh

## Set the working directory for the start script
WORKDIR /opt/nomad/src

## Launch the start script (that contains the cpp compilation instructions)
RUN /opt/nomad/src/build.sh