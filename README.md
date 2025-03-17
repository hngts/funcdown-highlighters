# Funcdown Syntax Highlighters

`mode-funcdown.js` is for **Ace Editor**. 

`funcdown.sublime-syntax` is for **Sublime Text Editor**.

`fncd.lua` is for **Textadept**.

## Ace Editor 
Place/save the file in Your ace/ directory where main `ace.js` is and other `mode-*.js` files are.

## Sublime Text Editor 
Place/save the file into Your `~/.config/sublime-text/Packages/User` directory. 

## Textadept
*(step 2 is not necessary if automatic extension detection is irrelevant)

1. Place/save the file into `~/.textadept/lexers` directory. 

2. Open main `lexer.lua` file from textadept source directory and find `local extensions` line almost at the bottom of the file, then add something like this `['fncd.phtml'] = 'fncd', fncd = 'fncd',` where appropriate, right before/above `gd` or after `fstab` extension.


### Funcdown
Funcdown is "c-function syntax alike" markup language generator. 

Go to [Funcdown Playground](https://hngts.com/?mkp=fncd#) to see it in action.
