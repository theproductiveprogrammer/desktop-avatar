#!/bin/bash
VERSION=$(cat package.json | grep '^[\t ]*"version"[ \t]*:' | sed 's/.*"version".*"\(.*\)",/\1/')

function copy_code() {
  cd src

  cp ../../*js . || exit 1

  rm index.js || exit 1
  rm wins.js || exit 1
  rm preload-*.js || exit 1
  rm dbg.js || exit 1

  patch < ../src-patches/*patch || exit 1

  cd ..
}

copy_code

docker build . -t desktop-avatar:latest
docker tag desktop-avatar:latest desktop-avatar:$VERSION
docker tag desktop-avatar:latest everlifeai/desktop-avatar:$VERSION
docker tag desktop-avatar:latest everlifeai/desktop-avatar:latest
