#!/bin/sh

for file in ~/.config/profile.d/*; do
	source "$file"
done


### MANAGED BY RANCHER DESKTOP START (DO NOT EDIT)
export PATH="/Users/jobstoit/.rd/bin:$PATH"
### MANAGED BY RANCHER DESKTOP END (DO NOT EDIT)
. "$HOME/Library/Application Support/org.dfinity.dfx/env"
. "$HOME/.cargo/env"
