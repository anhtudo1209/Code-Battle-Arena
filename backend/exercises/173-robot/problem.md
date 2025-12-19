# Robot

A robot starts at position (0, 0) facing North.  
It receives a sequence of commands, each causing a movement of exactly 1 unit:

- G — move forward (in the direction the robot is currently facing)  
- L — move left (relative to its current facing)  
- R — move right (relative to its current facing)  
- B — move backward (opposite the direction it's facing)

The four facing directions:
- North: (0, 1)  
- East:  (1, 0)  
- South: (0, -1)  
- West:  (-1, 0)

## Input
- Line 1: integer n (n ≤ 100)  
- Line 2: a string of n characters consisting of G, L, R, B

## Output
- Two integers representing the final coordinate (x, y)

## Sample Input
4  
BLGR

## Sample Output
2 -2
