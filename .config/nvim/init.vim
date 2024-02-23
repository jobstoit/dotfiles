" General
call plug#begin()
" Language support
Plug 'neovim/nvim-lspconfig'
Plug 'racer-rust/vim-racer'
Plug 'fatih/vim-go', { 'tag': '*' }
Plug 'rust-lang/rust.vim'
Plug 'hashivim/vim-terraform'

" Tools
Plug 'itchyny/lightline.vim'
Plug 'nvim-lua/plenary.nvim'
Plug 'nvim-telescope/telescope.nvim', { 'tag': '0.1.2' }
Plug 'airblade/vim-gitgutter'
Plug 'tpope/vim-fugitive'

" Colors
Plug 'tjdevries/colorbuddy.vim'
Plug 'catppuccin/nvim', { 'as': 'catppuccin' }
Plug 'jordanbrauer/citylights.nvim'
Plug 'joshdick/onedark.vim'
Plug 'christoomey/vim-tmux-navigator'
call plug#end()

"syntax on
"filetype plugin indent on
set number

" set relateive numbers
set relativenumber
let mapleader = "\<Space>"

" Theming
"colorscheme citylights
"colorscheme catppuccin-mocha
colorscheme catppuccin-macchiato
let g:lightline = {'colorscheme': 'catppuccin'}
"colorscheme onedark

"colorscheme doom-one
"colorscheme codeschool
hi! Normal ctermbg=NONE guibg=NONE
hi! NormalNC ctermbg=NONE guibg=NONE
hi! LineNr ctermbg=NONE guibg=NONE
hi! NonText ctermbg=NONE guibg=NONE

" Key mapping
nmap - :Ex<CR>
nmap <C-l> :lnext<CR>
nmap <C-h> :lprevious<CR>
nmap <C-j> :cnext<CR>
nmap <C-k> :cprevious<CR>
nmap <C-q> :q<CR>
"nmap <C-\> :tabe<CR>:terminal<CR><C-w>j:q<CR>

" Nvim Terminal remap
tnoremap <Esc> <C-\><C-n>
tnoremap <C-w> <Esc><C-w>
tnoremap <g-t> <Esc><C-w>gt

" Find files using Telescope command-line sugar.
nnoremap <leader>ff <cmd>Telescope find_files<cr>
nnoremap <leader>fg <cmd>Telescope live_grep<cr>
nnoremap <leader>fb <cmd>Telescope buffers<cr>
nnoremap <leader>fh <cmd>Telescope help_tags<cr>

" autocmd BufWritePre *.rs lua vim.lsp.buf.formatting_sync(nil, 200)
"
set completeopt-=preview

if executable('cargo')
    lua require'lspconfig'.rust_analyzer.setup({})
lua << EOF
    local nvim_lsp = require'lspconfig'
    
    local on_attach = function(client, bufnr)
      -- Enable completion triggered by <c-x><c-o>
      vim.api.nvim_buf_set_option(bufnr, 'omnifunc', 'v:lua.vim.lsp.omnifunc')
    end
    
    nvim_lsp.rust_analyzer.setup({
        on_attach = on_attach,
	cmd = {
		"rustup", "run", "stable", "rust-analyzer"
	}
    })

EOF
    
    autocmd FileType typescript setlocal formatprg=prettier\ --parser\ typescript
endif
