# Identifying the Correct Cows

Bờm has n cows, each painted with a positive integer such that the total of these numbers is S.  
One day, after releasing them to graze, Bờm finds that **n + 2 cows** return — two extra cows belonging to the landlord have mixed in.  
The landlord also paints positive integers on his cows, but he cannot remember which two are his.

Bờm decides on a method:  
From the **n + 2 cows**, choose **n cows** whose numbers sum exactly to **S**.  
These n cows must be Bờm’s, and the remaining two will be returned to the landlord.

Always assume the input guarantees a valid solution.

## Input
- Line 1: two positive integers n and S (n ≤ 1000, S ≤ 10⁹)  
- The next n + 2 lines: each contains one positive integer — the numbers painted on the n + 2 cows (including Bờm's n cows and the landlord's 2 cows)

## Output
- n lines, each containing the positive integer painted on one of Bờm’s cows

## Sample Input
7 100  
8  
6  
5  
1  
37  
30  
28  
22  
36

## Sample Output
8  
6  
5  
1  
30  
28  
22
