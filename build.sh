#!/bin/bash
VERSION=$(cat package.json | grep '^[\t ]*"version"[ \t]*:' | sed 's/.*"version".*"\(.*\)",/\1/')
docker build . -t desktop-avatar:latest
docker tag desktop-avatar:latest desktop-avatar:$VERSION
docker tag desktop-avatar:latest everlifeai/desktop-avatar:$VERSION
docker tag desktop-avatar:latest everlifeai/desktop-avatar:latest
