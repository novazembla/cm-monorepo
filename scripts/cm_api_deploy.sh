#!/bin/bash

export HOME=/home/pacs/bzl00/users/api
export PATH=$HOME/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
export NVM_DIR=/home/pacs/bzl00/users/api/.nvm
source $NVM_DIR/nvm.sh

cd $HOME/cm-api-build
git stash
git stash drop
git pull 

nvm use 16

npm ci

if [ $? -eq 0 ]; then
  echo "npi ci: packages updated"
else
  echo "npm ci: failed"
  exit 1
fi

npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "npx prisma migrate deploy: db migrations applied"
else
  echo "npx prisma migrate deploy: failed"
  exit 1 
fi

npm run build:api

if [ $? -eq 0 ]; then
  echo "npm run build:api: build complete"
else
  echo "npm run build:api: failed"
  exit 1 
fi

cd .. 

echo "stopping service"
monit stop api

sleep 15

if [ ! -d cm-api-live ]; then
  echo "copying cm-api-build to cm-api-live"
  cp -Rp cm-api-build cm-api-live
fi

echo "renaming cm-api-live to cm-api-tmp"
mv cm-api-live cm-api-tmp

echo "renaming cm-api-build to cm-api-live"
mv cm-api-build cm-api-live

echo "starting service"
monit start api

echo "cm-api-tmp to cm-api-build"
mv cm-api-tmp cm-api-build

echo "(re)generating sitemaps"
cd cm-api-live
node packages/api/dist/scripts/generateSitemaps.js
cd ..

echo "done"