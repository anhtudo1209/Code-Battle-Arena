# Binary Recursive Selection Sort

## Problem

In this problem, we improve the classic Selection Sort using **Binary Recursion**.

The array is divided into three parts:

| Sorted Part I | Unsorted Part | Sorted Part II |

Initially:
- Sorted Part I is empty
- Sorted Part II is empty
- The whole array is Unsorted

---

## Algorithm Description

At each recursive step:

1. From the **unsorted part**, find:
   - the **minimum element** using recursion
   - the **maximum element** using recursion
2. Place:
   - the minimum at the **end of Sorted Part I**
   - the maximum at the **front of Sorted Part II**
3. Reduce the unsorted part and repeat recursively.

The process ends when the unsorted part is empty or contains one element.

---

## Input

5
5 4 3 2 1


## Output

1 2 3 4 5

## Constraints

- 1 ≤ n ≤ 10⁵  
- Elements are integers

---

## Notes

- You must use **binary recursion**
- Iteration is allowed only where necessary
- Do **not** use built-in sort functions
