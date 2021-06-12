#!/bin/bash
docker run -it --rm -v $(pwd)/src:/desktop-avatar/src desktop-avatar:latest "$@"
