{
  description = "Jobs basic configuration";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nix-darwin.url = "github:LnL7/nix-darwin/master";
    nix-darwin.inputs.nixpkgs.follows = "nixpkgs";
    nix-homebrew.url = "github:zhaofengli-wip/nix-homebrew";
  };

  outputs = inputs@{ self, nix-darwin, nixpkgs, nix-homebrew }:
  let
    configuration = { pkgs, config, ... }: {

      nixpkgs.config.allowUnfree = true;

      # List packages installed in system profile. To search by name, run:
      # $ nix-env -qaP | grep wget
      environment.systemPackages = [ 
          pkgs.mkalias
          pkgs.neovim
          pkgs.tmux
          pkgs.fzf
          pkgs.k9s
          pkgs.stow
          pkgs.gh
          pkgs.fzf
          # pkgs.ghostty
          pkgs.slack
          pkgs.brave
          pkgs.kubectl
          pkgs.kubernetes-helm

          # Programming languages
          pkgs.go
          pkgs.golangci-lint
          pkgs.rustup
        ];

        homebrew = {
            enable = true;
            casks = [
              # "boundary-desktop"
              "orbstack"
              "monero-wallet"
              "ledger-live"
              "private-internet-access"
              "ghostty"
            ];
        };

      fonts.packages = [
        pkgs.nerd-fonts.hack
      ];

      system.defaults = {
        NSGlobalDomain.AppleICUForce24HourTime = true;
      };

      system.activationScripts.applications.text = let
        env = pkgs.buildEnv {
          name = "system-applications";
          paths = config.environment.systemPackages;
          pathsToLink = "/Applications";
        };
      in
        pkgs.lib.mkForce ''
        # Set up applications.
        echo "setting up /Applications..." >&2
        rm -rf /Applications/Nix\ Apps
        mkdir -p /Applications/Nix\ Apps
        find ${env}/Applications -maxdepth 1 -type l -exec readlink '{}' + |
        while read -r src; do
          app_name=$(basename "$src")
          echo "copying $src" >&2
          ${pkgs.mkalias}/bin/mkalias "$src" "/Applications/Nix Apps/$app_name"
        done
      '';

      # Necessary for using flakes on this system.
      nix.settings.experimental-features = "nix-command flakes";

      # Enable alternative shell support in nix-darwin.
      programs.zsh.enable = true;

      # Set Git commit hash for darwin-version.
      system.configurationRevision = self.rev or self.dirtyRev or null;

      # Used for backwards compatibility, please read the changelog before changing.
      # $ darwin-rebuild changelog
      system.stateVersion = 6;

      # The platform the configuration will be used on.
      nixpkgs.hostPlatform = "aarch64-darwin";
    };
  in
  {
    # Build darwin flake using:
    # $ darwin-rebuild build --flake .#simple
    darwinConfigurations."jobstoit" = nix-darwin.lib.darwinSystem {
      modules = [
        configuration
        nix-homebrew.darwinModules.nix-homebrew{
          nix-homebrew = {
              enable = true;
              enableRosetta = true;
              user = "jobstoit";
              autoMigrate = true;
              # taps = {
              #   "":""
              # };
          };
        }
      ];
    };

    darwinPackages = self.darwinConfigurations."jobstoit".pkgs;
  };
}
