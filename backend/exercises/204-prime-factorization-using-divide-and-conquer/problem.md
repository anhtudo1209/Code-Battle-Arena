# Prime Factorization using Divide and Conquer

Given a natural number N, perform **prime factorization** using a  
**Divide and Conquer strategy combined with Binary Recursion**.

You must follow these steps:

1. Given a natural number N
2. Find the **two largest divisors** of N (d1, d2) such that:
   - d1 × d2 = N
3. If d1 or d2 is **not prime**, recursively apply the same process
4. If both d1 and d2 are prime, stop recursion
5. Output all prime factors in ascending order

**Constraints**
- Simple trial division from 2 to N is NOT allowed
- You must use **Divide & Conquer recursion**
- Binary recursion is required

## Input
A natural number N

## Output
All prime factors of N in ascending order

## Sample Input
120

## Sample Output
2 2 2 3 5
