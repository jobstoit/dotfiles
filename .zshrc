#!/bin/sh
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="af-magic"
plugins=(git)
source $ZSH/oh-my-zsh.sh
export GPG_TTY=$(tty)

export SHELL=$(which zsh)
for file in ~/.config/profile.d/*; do
	. $file
done

autoload -U +X bashcompinit && bashcompinit
export TERM=xterm-256color
