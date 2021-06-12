#!/bin/bash
docker run -it --rm \
  -v $(pwd)/src:/desktop-avatar/src \
  -v $(pwd)/desktop-avatar-docker-db:/root/desktop-avatar \
  desktop-avatar:latest "$@"
