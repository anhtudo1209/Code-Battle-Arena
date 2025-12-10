# Spy

A mafia boss moves on a 2D grid starting from position (0, 0). Each step is exactly 1 unit in one of four directions:  
- 'R' = right  
- 'L' = left  
- 'U' = up  
- 'D' = down  

A spy sits at position (x, y).  
The spy can overhear the mafia boss if, at a given time step, the boss is either:
- exactly at (x, y), or  
- at any of the 8 adjacent cells around (x, y).

Your task is to determine all time steps at which the spy overhears the conversation.

## Input
- Line 1: integers x and y — the spy’s coordinates (−10⁴ ≤ x, y ≤ 10⁴)
- Line 2: integer k — the number of steps in the mafia’s route (1 ≤ k ≤ 10⁵)
- Line 3: a string of length k describing the movement, using characters 'R', 'L', 'U', 'D'

## Output
- If the spy never overhears anything, output `-1`
- Otherwise, output each time step (1-based index) at which the spy overhears the mafia, one per line

## Sample Input
2 2  
3  
RRR

## Sample Output
-1

## Sample Input
-1 0  
8  
DDLLUURU

## Sample Output
0  
1  
5  
6  
7  
8
