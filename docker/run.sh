#!/bin/bash

echo 'Login'
echo '*****'
read -p "Username: " uname
read -sp "Password: " passw;echo
echo please wait...
echo

docker run -it --rm \
  -v $(pwd)/src:/desktop-avatar/src \
  -v $(pwd)/desktop-avatar-docker-db:/root/desktop-avatar \
  -e "SALESBOX_USERNAME=$uname" \
  -e "SALESBOX_PASSWORD=$passw" \
  desktop-avatar:latest "$@"
