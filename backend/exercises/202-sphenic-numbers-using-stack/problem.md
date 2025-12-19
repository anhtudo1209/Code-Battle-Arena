# Sphenic Numbers using Stack (Linked List ADT)

Write a program to enter a natural number n and find all sphenic numbers from 1 to n
using **Recursion (combined with iteration if necessary)** and a **Stack implemented using Linked List ADT**.

A sphenic number is a product of **exactly three distinct prime numbers**
(p × q × r, where p ≠ q ≠ r and all are prime).

### Stack Rules
- Stack size is fixed to **3**
- Stack must be implemented using **Linked List**
- You must follow these steps:

### Step 1
Find three distinct prime factors of a number and **push them into the stack**

Example:
30 = 2 × 3 × 5  
push 2 → push 3 → push 5

### Step 2
Pop all elements from the stack and calculate their product

pop 5 → pop 3 → pop 2  
calculate 2 × 3 × 5 = 30

### Step 3
Display all sphenic numbers from 1 to n

## Input
A natural number n

## Output
Print all sphenic numbers from 1 to n

## Sample Input
70

## Sample Output
30 42 66 70
