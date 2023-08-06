#!/bin/sh
set -ex

# Downloading golang
[ -z $(which go) ] && brew install go 
echo "export GOPATH=~/.go\nexport PATH=\$GOPATH/bin:\$PATH" > ~/.config/profile.d/_go 
go version

# install basic tooling
go install -v github.com/uudashr/gopkgs/cmd/gopkgs@v2 && \
    go install -v github.com/ramya-rao-a/go-outline@latest && \
    go install -v github.com/cweill/gotests/gotests@latest && \
    go install -v github.com/fatih/gomodifytags@latest && \
    go install -v github.com/josharian/impl@latest && \
    go install -v github.com/haya14busa/goplay/cmd/goplay@latest && \
    go install -v github.com/go-delve/delve/cmd/dlv@latest && \
    go install -v github.com/golangci/golangci-lint/cmd/golangci-lint@latest && \
    go install -v golang.org/x/tools/gopls@latest && \
    go install -v honnef.co/go/tools/cmd/staticcheck@latest && \
    sudo rm -rf $GOPATH/src $GOPATH/pkg $HOME/.cache/go $HOME/.cache/go-build

