# Parentheses Sequence

A parentheses sequence is defined recursively as follows:
- An empty string is a valid parentheses sequence.
- If A is a valid parentheses sequence, then (A) is also a valid sequence.
- If A and B are valid parentheses sequences, then AB is also valid.

Any string containing characters other than "(" and ")" is considered invalid.

## Input
A string S.

## Output
- Print VALID if S is a valid parentheses sequence.
- Print NOT VALID if S contains only '(' and ')' but is not a valid sequence.
- Print INVALID if S contains any other characters.

## Sample Input
(A()B)

## Sample Output
INVALID

## Sample Input
()()(())

## Sample Output
VALID

## Sample Input
((())

## Sample Output
NOT VALID
