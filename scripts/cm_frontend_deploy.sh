#!/bin/bash

export HOME=/home/pacs/bzl00/users/domain
export PATH=$HOME/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
export NVM_DIR=/home/pacs/bzl00/users/domain/.nvm
source $NVM_DIR/nvm.sh

cd $HOME/cm-frontend-build
git stash
git stash drop
git pull
if [ $? -eq 0 ]; then
  echo "git pull: pulled updates from github"
else
  echo "git pull: failed"
  exit 1
fi

nvm use 24

npm ci

if [ $? -eq 0 ]; then
  echo "npm ci: packages updated"
else
  echo "npm ci: failed"
  exit 1
fi

NODE_ENV=production npx next build

if [ $? -eq 0 ]; then
  echo "npx next build: build complete"
else
  echo "npx next build: failed"
  exit 1 
fi

cd .. 

echo "stopping service"
monit stop frontend

sleep 5

if [ ! -d cm-frontend-live ]; then
  echo "copying cm-frontend-build to cm-frontend-live"
  cp -Rp cm-frontend-build cm-frontend-live
fi

echo "renaming cm-frontend-live to cm-frontend-tmp"
mv cm-frontend-live cm-frontend-tmp

echo "renaming cm-frontend-build to cm-frontend-live"
mv cm-frontend-build cm-frontend-live

echo "starting service"
monit start frontend

echo "cm-frontend-tmp to cm-frontend-build"
mv cm-frontend-tmp cm-frontend-build

echo "done"