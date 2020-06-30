#!/bin/sh

cd src/webapp
yarn install
node --max-old-space-size=4096 ./node_modules/@angular/cli/bin/ng build --prod
cd ../..
docker build -t nomad_webapp containers/webapp
docker build -t oss-nomad-webapp-prod -f containers/webapp_prod/Dockerfile .