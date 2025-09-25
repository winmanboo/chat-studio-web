#!/bin/bash

export NEXT_PUBLIC_API_BASE_URL="http://chat-studio-server:8080"
export SW_VERSION_CHECK_INTERVAL=60000

pnpm start --port 3000