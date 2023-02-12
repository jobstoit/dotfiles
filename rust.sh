#!/bin/sh
set -ex

# Download rust
export PATH="~/.cargo/bin:$PATH"
nix-env -iA nixpkgs.rustup && \
	rustup toolchain install stable
	rustup component add rust-analyzer rls rust-analysis rust-src rustfmt clippy && \
	echo "export PATH=~/.cargo/bin:\$PATH\nsource <(rustup completions \${SHELL#/bin/} rustup)\nsource <(rustup completions \${SHELL#/bin/} cargo)" > ~/.config/profile.d/_rust && \
	cargo version

# neovim config
git clone https://github.com/rust-lang/rust.vim.git ~/.config/nvim/pack/plugins/start/rust.vim
