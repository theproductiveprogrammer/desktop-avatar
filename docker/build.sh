#!/bin/bash
set -e
VERSION=$(cat ../package.json | grep '^[\t ]*"version"[ \t]*:' | sed 's/.*"version".*"\(.*\)",/\1/')

function show_help() {
  echo ./build.sh [docker]
}

function copy_code() {
  cd src

  echo copying main code
  cp ../../*js .

  rm index.js
  rm wins.js
  rm preload-*.js
  rm dbg.js

  echo copying store reducer
  cp ../../web/store.js ./engine/

  echo copying avatar engine code
  cp ../../web/avatar/*js ./engine/avatar/

  echo setting docker specific code..
  cp ../index.js .
  cp ../chat.js .
  cp ../settings.js .
  cp ../login.js .
  cp ../ww.js ./engine/avatar/

  cd ..
}

function build_docker() {
  docker build . -t desktop-avatar:latest
  docker tag desktop-avatar:latest desktop-avatar:$VERSION
  docker tag desktop-avatar:latest everlifeai/desktop-avatar:$VERSION
  docker tag desktop-avatar:latest everlifeai/desktop-avatar:latest
}




SWITCH=$1
if [ -z "$SWITCH" ]
then
  SWITCH="copy"
fi

case "$SWITCH" in
"-h" | "--help" | "help")
  show_help
  ;;
"docker")
  build_docker
  ;;
"copy")
  copy_code
  ;;
*)
  show_help
  ;;
esac
