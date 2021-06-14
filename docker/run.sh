#!/bin/bash
function login() {
  echo 'Login'
  echo '*****'
  read -p "Username: " uname
  read -sp "Password: " passw;echo
  echo please wait...
  echo
}

function run_dev() {
  docker run -it --rm \
    -v $(pwd)/src:/desktop-avatar/src \
    -v $(pwd)/desktop-avatar-docker-db:/root/desktop-avatar \
    -e "SALESBOX_USERNAME=$uname" \
    -e "SALESBOX_PASSWORD=$passw" \
    desktop-avatar:latest "$@"
}

function run_prod() {
  docker run -it --rm \
    -v $(pwd)/desktop-avatar-docker-db:/root/desktop-avatar \
    -e "SALESBOX_USERNAME=$uname" \
    -e "SALESBOX_PASSWORD=$passw" \
    desktop-avatar:latest "$@"
}

login

if [ "$1" == "dev" ]
then
  shift
  run_dev "$@"
else
  run_prod
fi
