-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here
vim.keymap.set("i", "<C-n>", "<C-x><C-o>", { desc = "omnicomplete on ctrl-n", remap = true })
vim.keymap.set("n", "<C-q>", ":q<CR>", { remap = true })

vim.keymap.set("n", "gh", "0", { desc = "go to the beginning of the line" })
vim.keymap.set("n", "gl", "$", { desc = "go to the end of the line" })
