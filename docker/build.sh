#!/bin/bash
set -e
VERSION=$(cat ../package.json | grep '^[\t ]*"version"[ \t]*:' | sed 's/.*"version".*"\(.*\)",/\1/')

function copy_code() {
  cd src

  cp ../../*js .

  rm index.js
  rm wins.js
  rm preload-*.js
  rm dbg.js

  echo copying index.js...
  cp ../index.js .

  cd ..
}

copy_code

docker build . -t desktop-avatar:latest
docker tag desktop-avatar:latest desktop-avatar:$VERSION
docker tag desktop-avatar:latest everlifeai/desktop-avatar:$VERSION
docker tag desktop-avatar:latest everlifeai/desktop-avatar:latest