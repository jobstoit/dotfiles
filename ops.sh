#!/bin/sh
set -ex

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
	mv kubectl ~/.local/bin/kubectl && \
	sudo chmod +x ~/.local/bin/kubectl && \
	echo "source <(kubectl completion \${SHELL#/bin/})" > ~/.config/profile.d/_kubectl && \
	kubectl version --client=true -o yaml

# Install helm
curl -Lso - https://get.helm.sh/helm-v3.11.0-linux-amd64.tar.gz | tar -C ~/.local/bin --strip-components=1 -xzf - linux-amd64/helm && \
	sudo chmod +x ~/.local/bin/helm && \
	echo "source <(kubectl completion \${SHELL#/bin/})" > ~/.config/profile.d/_helm && \
	helm version
