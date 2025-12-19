# Double Prime Numbers

A prime number is a positive integer that has exactly two divisors: 1 and itself.  
An integer x is called a *double prime number* if it satisfies both conditions:
1. x is a prime number  
2. The sum of the digits of x is also a prime number

Given a sequence of n integers, count how many double prime numbers appear in the sequence.

## Input
- Line 1: a positive integer n (n ≤ 1000)  
- Line 2: n integers a1, a2, ..., an (|ai| ≤ 10⁹)

## Output
- Line 1: the number of double prime numbers in the sequence  
- Line 2: the double prime numbers in the sequence, from left to right

## Sample Input
5  
7 6 23 17 11

## Sample Output
3  
7 23 11
