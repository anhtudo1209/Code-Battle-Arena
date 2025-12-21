# Pythagorean Triplets in Linked List

Given a sequence of integers converted into a **Linked List**, your task is to find and print all Pythagorean triplets.

A Pythagorean triplet consists of three integers $(a, b, c)$ such that:
$$a^2 + b^2 = c^2$$

**Note:**
* You must work with the **Linked List** data structure (using pointers).
* Print the triplets in the format `(a, b, c)`.
* The order of printing matters for the test cases: try to find triplets by traversing the list in a standard nested manner.

## Input
A single line containing the number of elements $N$, followed by $N$ integers.

## Output
Print each identified triplet in the format `(a, b, c)` followed by a space or new line.

## Sample Input
12
4 15 28 45 40 9 53 41 8 17 3 5

## Sample Output
(4, 3, 5) (15, 8, 17) (40, 9, 41) (28, 45, 53)

## Explanation
* $4^2 + 3^2 = 16 + 9 = 25 = 5^2$
* $15^2 + 8^2 = 225 + 64 = 289 = 17^2$
* ...and so on.