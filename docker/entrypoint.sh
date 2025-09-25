#!/bin/bash

export NEXT_PUBLIC_API_BASE_URL=${BASE_URL}
export SW_VERSION_CHECK_INTERVAL=60000

pnpm start --port ${PORT}