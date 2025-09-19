# syntax = docker/dockerfile:1

ARG UBUNTU_VERSION=24.04
FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu-${UBUNTU_VERSION}

# Install Node.js
RUN \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt install -y nodejs

ARG USERNAME=vscode
USER ${USERNAME}

WORKDIR /workspace

CMD ["/bin/bash"]
