set nocompatible    " prefer vim over vi (This must be first option)

syntax on           " syntax highlighting on
if has("autocmd")
  filetype plugin indent on " filetype detection and indentation
else
  set autoindent            " autoindenting is a good default
endif
set textwidth=72    " textwidth for optimal reading
set hidden          " allow multiple edited buffers
set noautowrite     " only I should write files
set incsearch       " do incremental searching
set ignorecase      " ignore case when searching
set smartcase       " use case when containing uppercase
set mouse=a         " mouse usually works
set mousehide       " hide the mouse pointer while typing
set backspace=indent,eol,start  " allow backspace over everything
" Indent settings
set expandtab
set shiftwidth=2
set tabstop=2
" Display invisible characters
set lcs=tab:>-,trail:.,nbsp:%,extends:>,precedes:<
set list

" backups - live dangerously!
se nobackup nowritebackup
