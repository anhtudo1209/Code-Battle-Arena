# Doubling Game
The game is described as follows: Two players take turns, and each is given a number — player 1 has X and player 2 has Y. There are N rounds.
Player X goes first. In each round, the current player doubles their number.
After N rounds finish, suppose player X now has the number W, and player Y now has the number Z.
You must output the integer division:

$$
\frac{\max(W, Z)}{\min(W, Z)}
$$

# Input
The first line contains an integer T, the number of test cases.
Each test case consists of a single line containing three integers X, Y, N.

# Output
For each test case, your program must print one integer — the corresponding result.

# Sample Input
2
1 2 1
3 2 3

# Sample Output
1
3