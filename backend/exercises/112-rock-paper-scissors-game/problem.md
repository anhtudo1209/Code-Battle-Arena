# Rock–Paper–Scissors Game

Bac and Nam are playing the game rock–paper–scissors. Each player shows one of three hand signs: rock, scissors, or paper.  
The rules are as follows:

- Rock beats scissors  
- Scissors beat paper  
- Paper beats rock  
- If both players choose the same sign, the result is a draw

Given the hand signs of Bac and Nam in a single round, determine the winner or whether it is a draw.

## Input
Two integers `a` and `b` (0 ≤ a, b ≤ 2):  
- `0` for rock  
- `1` for scissors  
- `2` for paper  

`a` is Bac’s hand sign, and `b` is Nam’s hand sign.

## Output
Print:  
- `"BAC"` if Bac wins  
- `"NAM"` if Nam wins  
- `"HOA"` if the game is a draw  

(Results must be printed in uppercase.)

## Sample Input
0 0

## Sample Output
HOA

## Sample Input
0 1

## Sample Output
BAC

## Sample Input
1 0

## Sample Output
NAM
