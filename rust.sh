#/bin/sh
 set -ex

 # Download rust
 export PATH="~/.cargo/bin:$PATH"
 curl -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal --no-modify-path --default-toolchain stable \
 		-c rls rust-analysis rust-src rustfmt clippy && \
 	echo "export PATH=~/.cargo/bin:\$PATH\nsource <(rustup completions \${SHELL#/bin/} rustup)\nsource <(rustup completions \${SHELL#/bin/} cargo)" > ~/.config/profile.d/_cargo && \
 	rustup component add rust-analyzer && \
 	cargo version

 # neovim config
 git clone https://github.com/rust-lang/rust.vim.git ~/.config/nvim/pack/plugins/start/rust.vim
