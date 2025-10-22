return {
  { "fcpg/vim-farout" },
  { "tpope/vim-fugitive" },
  -- { "mattn/emmet-vim" },
  -- { "tpope/vim-dadbod" },
  -- { "kristijanhusak/vim-dadbod-completion" },
  -- { "kristijanhusak/vim-dadbod-ui" },
  --{ "fatih/vim-go" },
  {
    "christoomey/vim-tmux-navigator",
    cmd = {
      "TmuxNavigateLeft",
      "TmuxNavigateDown",
      "TmuxNavigateUp",
      "TmuxNavigateRight",
      "TmuxNavigatePrevious",
    },
    keys = {
      { "<c-h>", "<cmd><C-U>TmuxNavigateLeft<cr>" },
      { "<c-j>", "<cmd><C-U>TmuxNavigateDown<cr>" },
      { "<c-k>", "<cmd><C-U>TmuxNavigateUp<cr>" },
      { "<c-l>", "<cmd><C-U>TmuxNavigateRight<cr>" },
    },
  },
}
