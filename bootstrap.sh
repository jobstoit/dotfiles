#!/bin/sh
set -ex

DOTFILES_ROOT=$(dirname "$0")
NVIM_PATH=~/.config/nvim
NVIM_PLUGIN=$NVIM_PATH/pack/plugins/start

mkdir -p ~/.local/bin
mkdir -p ~/.config/profile.d
mkdir -p $NVIM_PATH/colors
mkdir -p $NVIM_PLUGIN

# downloading neovim
curl -Lo - https://github.com/neovim/neovim/releases/download/stable/nvim-linux64.tar.gz | sudo tar -C ~/.local -xzf - && \
	ln -s ~/.local/nvim-linux64/bin/* ~/.local/bin/ && \
	nvim --version

cp -f $DOTFILES_ROOT/vim/citylights.vim $NVIM_PATH/colors/citylights.vim
cp -f $DOTFILES_ROOT/vim/init.vim $NVIM_PATH/init.vim
cp -f $DOTFILES_ROOT/.bashrc ~/.bashrc
cp -f $DOTFILES_ROOT/.zshrc ~/.zshrc
cp -f $DOTFILES_ROOT/.profile ~/.config/profile.d/personal

[ -d ~/.oh-my-zsh ] || sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Install vim plugins
git clone https://github.com/itchyny/lightline.vim.git $NVIM_PLUGIN/lightline.vim
git clone https://github.com/mattn/emmet-vim.git $NVIM_PLUGIN/emmet-vim
git clone https://github.com/neovim/nvim-lspconfig.git $NVIM_PLUGIN/nvim-lspconfig

# Donwload tools

[ -z $GOLANG_DISABLED ] && GOLANG_DISABLED='false'
[ -z $RUST_DISABLED ] && RUST_DISABLED='false'
[ -z $OPS_DISABLED ] && OPS_DISABLED='false'

[ $GOLANG_DISABLED != 'true' ] && sh $DOTFILES_ROOT/golang.sh
[ $RUST_DISABLED != 'true' ] && sh $DOTFILES_ROOT/rust.sh
[ $OPS_DISABLED != 'true' ] && sh $DOTFILES_ROOT/ops.sh

