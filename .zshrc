#!/bin/sh

# Set the directory we want to store zinit and plugins
ZINIT_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}/zinit/zinit.git"

# Download Zinit, if it's not there yet
if [ ! -d "$ZINIT_HOME" ]; then
   mkdir -p "$(dirname $ZINIT_HOME)"
   git clone https://github.com/zdharma-continuum/zinit.git "$ZINIT_HOME"
fi

source "${ZINIT_HOME}/zinit.zsh"

zinit light Aloxaf/fzf-tab

# zhistory
setopt appendhistory
setopt sharehistory
setopt hist_ignore_space
setopt hist_ignore_all_dups
setopt hist_save_no_dups
setopt hist_ignore_dups
setopt hist_find_no_dups

# OhMyZSH
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="af-magic"
ZSH_DOTENV_PROMPT=false
plugins=(git git-auto-fetch fzf dotenv golang kubectl helm gh rust docker docker-compose)
source $ZSH/oh-my-zsh.sh
export GPG_TTY=$(tty)

# own config
export SHELL=$(which zsh)
for file in ~/.config/profile.d/*; do
	. $file
done

autoload -U +X bashcompinit && bashcompinit
export TERM=xterm-256color

# Keybindings
bindkey -e
bindkey '^p' history-search-backward
bindkey '^n' history-search-forward
bindkey '^[w' kill-region

# completion styling
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'
zstyle ':completion:*' list-colors "${(s.:.)LS_COLORS}"
zstyle ':completion:*' menu no

# Shell intergrations
[ $(command -v fzf) ] && \
  eval "$(fzf --zsh)" && \
  zstyle ':fzf-tab:complete:cd:*' fzf-preview 'ls --color $realpath'
[ $(command -v zoxide ) ] && eval "$(zoxide init --cmd cd zsh)" && \
  [ $(command -v fzf) ] && zstyle ':fzf-tab:complete:__zoxide_z:*' fzf-preview 'ls --color $realpath'
