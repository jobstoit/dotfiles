#!/bin/sh
export PATH=$HOME/.local/bin:$PATH

for file in ~/.config/profile.d/*; do
	source "$file"
done
