# Odd/Even Counts in Linked List

Given a positive natural number $N$, we want to study its digits by converting the number into a **Linked List**, where each node contains a single digit.

Your task is to traverse this Linked List and count the number of **odd** and **even** digits.

**Note:**
* $0$ is considered an even number.
* The input number is already converted into a Linked List for you in the driver code. You just need to implement the processing logic.

## Input
A single positive natural number $N$.

## Output
Two integers separated by a space:
1.  The count of odd digits.
2.  The count of even digits.

## Sample Input
3450

## Sample Output
2 2

## Explanation
The number $3450$ is converted to a list: `3 -> 4 -> 5 -> 0 -> NULL`.
* Odd nodes: 3, 5 (Count: 2)
* Even nodes: 4, 0 (Count: 2)