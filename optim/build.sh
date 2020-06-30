#!/bin/sh
docker build -t oss-nomad-build-optim -f containers/build/Dockerfile .
docker build -t oss-nomad-optim -f containers/run/Dockerfile .