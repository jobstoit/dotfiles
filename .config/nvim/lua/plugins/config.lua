return {
  {
    "snacks.nvim",
    opts = {
      picker = {
        files = {
          hidden = true,
        },
      },
      dashboard = {
        preset = {
          header = [[
           ██╗ ██████╗ ██████╗     ███████╗████████╗ ██████╗ ██╗████████╗
           ██║██╔═══██╗██╔══██╗    ██╔════╝╚══██╔══╝██╔═══██╗██║╚══██╔══╝
           ██║██║   ██║██████╔╝    ███████╗   ██║   ██║   ██║██║   ██║   
      ██   ██║██║   ██║██╔══██╗    ╚════██║   ██║   ██║   ██║██║   ██║   
      ╚█████╔╝╚██████╔╝██████╔╝    ███████║   ██║   ╚██████╔╝██║   ██║   
       ╚════╝  ╚═════╝ ╚═════╝     ╚══════╝   ╚═╝    ╚═════╝ ╚═╝   ╚═╝   
 ]],
        -- stylua: ignore
        ---@type snacks.dashboard.Item[]
        keys = {
          { icon = " ", key = "f", desc = "Find File", action = ":lua Snacks.dashboard.pick('files')" },
          { icon = " ", key = "n", desc = "New File", action = ":ene | startinsert" },
          { icon = " ", key = "g", desc = "Find Text", action = ":lua Snacks.dashboard.pick('live_grep')" },
          { icon = " ", key = "r", desc = "Recent Files", action = ":lua Snacks.dashboard.pick('oldfiles')" },
          { icon = " ", key = "c", desc = "Config", action = ":lua Snacks.dashboard.pick('files', {cwd = vim.fn.stdpath('config')})" },
          { icon = " ", key = "s", desc = "Restore Session", section = "session" },
          { icon = " ", key = "x", desc = "Lazy Extras", action = ":LazyExtras" },
          { icon = "󰒲 ", key = "l", desc = "Lazy", action = ":Lazy" },
          { icon = " ", key = "q", desc = "Quit", action = ":qa" },
        },
        },
      },
    },
  },

  -- the opts function can also be used to change the default opts:
  {
    "nvim-lualine/lualine.nvim",
    event = "VeryLazy",
    opts = function(_, opts)
      opts.sections.lualine_y = {
        { "progress", separator = " ", padding = { left = 1, right = 0 } },
      }
      opts.sections.lualine_z = {
        { "location", padding = { left = 0, right = 1 } },
      }
    end,
  },
  {
    "neovim/nvim-lspconfig",
    opts = {
      inlay_hints = { enabled = false },
      format = { timeout_ms = 60000 },
    },
  },
  {
    "mfussenegger/nvim-lint",
    opts = {
      -- events = { "BufWritePost", "BufReadPost", "InsertLeave" },

      linters_by_ft = {
        -- go = { "golangcilint" },
      },
    },
  },
}
