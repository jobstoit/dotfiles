#!/bin/sh
export PATH=$HOME/.local/bin:$PATH

export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="af-magic"
plugins=(git)
source $ZSH/oh-my-zsh.sh

for file in ~/.config/profile.d/*; do
	. $file
done
