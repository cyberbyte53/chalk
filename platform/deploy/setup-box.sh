#!/bin/sh
# Once, on a new Ubuntu box: Docker with Compose. Run there: sh ~/chalk/deploy/setup-box.sh
set -eu
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER"
mkdir -p ~/chalk-backups
echo "Docker is ready. Log out and back in (or run 'newgrp docker') so docker works without sudo."
