#!/bin/sh
set -ex

DOTFILES_ROOT=$(dirname "$0")
NVIM_PATH=~/.config/nvim
NVIM_PLUGIN=$NVIM_PATH/pack/plugins/start

# For container installation
[ -z $USER ] && export USER=${HOME#/home/}

mkdir -p ~/.config/profile.d
mkdir -p $NVIM_PATH/colors
mkdir -p $NVIM_PLUGIN

# Install nix package manager
curl -L https://nixos.org/nix/install | sh && \
	. $HOME/.nix-profile/etc/profile.d/nix.sh && \
	echo "export PATH=~/.nix-profile/bin:\$PATH" > ~/.config/profile.d/_nix

# Install neovim
nix-env -iA nixpkgs.neovim && \
	nvim --version

[ -d ~/.oh-my-zsh ] || sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

cp -f $DOTFILES_ROOT/vim/citylights.vim $NVIM_PATH/colors/citylights.vim
cp -f $DOTFILES_ROOT/vim/init.vim $NVIM_PATH/init.vim
cp -f $DOTFILES_ROOT/.profile ~/.config/profile.d/personal
cat $DOTFILES_ROOT/.bashrc >> ~/.bashrc
cat $DOTFILES_ROOT/.zshrc >> ~/.zshrc


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

# github codespace 
if [ ! -z $GITHUB_CODESPACE_TOKEN ]; then
	sudo locale-gen en_US.UTF-8
fi

nix-env --delete-generations old
