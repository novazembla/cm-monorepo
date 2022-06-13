#!/bin/bash

export HOME=/home/pacs/bzl00/users/api
export PATH=$HOME/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
export NVM_DIR=/home/pacs/bzl00/users/api/.nvm
source $NVM_DIR/nvm.sh

cd $HOME/cm-backend-build
git stash
git stash drop
git pull
if [ $? -eq 0 ]; then
  echo "git pull: pulled updates from github"
else
  echo "git pull: failed"
  exit 1
fi

nvm use 16

npm ci
if [ $? -eq 0 ]; then
  echo "npm ci: packages updated"
else
  echo "npm ci: failed"
  exit 1
fi

npm run build:backend-read-env

if [ $? -eq 0 ]; then
  echo "npm run build:backend-read-env: build done"
else
  echo "npm run build:backend-read-env: failed"
  exit 1 
fi

cd .. 

if [ ! -d cm-backend-live ]; then
  echo "copying cm-backend-build to cm-backend-live"
  cp -Rp cm-backend-build cm-backend-live
fi

echo "renaming cm-backend-live to cm-backend-tmp"
mv cm-backend-live cm-backend-tmp

echo "renaming cm-backend-build to cm-backend-live"
mv cm-backend-build cm-backend-live

echo "cm-backend-tmp to cm-backend-build"
mv cm-backend-tmp cm-backend-build

echo "done"
