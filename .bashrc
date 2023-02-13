#!/bin/sh

for file in ~/.config/profile.d/*; do
	source "$file"
done

