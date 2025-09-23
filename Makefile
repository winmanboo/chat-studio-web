DOCKER_REGISTRY=deepcode
SERVER_IMAGE=$(DOCKER_REGISTRY)/chat-studio-web
VERSION=0.1.0

build-web:
	@echo "Building Web Docker image: $(SERVER_IMAGE)\:$(VERSION)"
	docker build -t $(SERVER_IMAGE):$(VERSION) ./
	@echo "Server Docker image built successfully: $(SERVER_IMAGE)\:$(VERSION)"

.PHONY: build-web
