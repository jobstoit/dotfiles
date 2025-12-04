# Dotfiles

My personal dotfiles ready for bootstrapping any computer, github-codespaces, gitpod etc.

## Nix darwin

To get started with nix Darwin [install nix](https://nixos.org/download/).
Then run the following command:

```
sudo nix --extra-experimental-features "nix-command flakes" run nix-darwin/master#darwin-rebuild -- switch --flake ~/.config/nix
```

In this example the dotfiles repository folder is sitting in the `~/Dev/jobstoit/` folder
