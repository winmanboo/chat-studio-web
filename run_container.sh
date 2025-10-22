#!/bin/bash

CONTAINER_NAME="chat-studio-web"
VERSION="0.3.1"

docker rm -f $CONTAINER_NAME

docker run --name $CONTAINER_NAME \
  -p 3000:3000 \
  --network chat \
  -d deepcode/$CONTAINER_NAME:$VERSION
