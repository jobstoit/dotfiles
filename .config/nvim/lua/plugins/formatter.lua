return {
  -- formatting time limit
  {
    --"neovim/nvim-lspconfig",
    "stevearc/conform.nvim",
    opts = {
      default_format_opts = { timeout_ms = 60000 },
    },
  },
}
