# Erasing Zeroes
Given a binary string S (containing only characters 0 and 1). We want to transform it into a string where all the 1’s in S form one single continuous segment.

# Examples:

If S is: 0, 1, 00111, or 01111100, then all the 1’s already form one continuous segment.

But if S is: 0101, 100001, or 11111111111101, then this condition is not satisfied.

You are allowed to delete the minimum number of 0’s in S (possibly zero) so that all the 1’s in S form a single continuous block.
Perform this task.

# Input

The first line contains an integer T (1 ≤ T ≤ 100), the number of test cases.
Each test case consists of a single non-empty binary string S, with length at most 100 characters.

# Output

For each test case, output a single integer — the minimum number of 0’s that must be deleted from S to make all the 1’s form one continuous segment.

# Sample input
3
010011
0
1111000

# Sample output
2
0
0