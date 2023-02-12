[ -z $USER ] && export USER=${HOME#/home/}
export EDITOR="nvim"
export VISUAL="nvim"
export GNUPGHOME=$HOME/.gnupg
export PASSWORD_STORE_DIR=$HOME/.pass
export TERM="xterm-256color"

alias e=$EDITOR
