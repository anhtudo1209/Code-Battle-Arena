# Number Compression

The compression of a number is defined as the sum of its digits.  
After repeatedly applying this compression, the number will eventually become a single digit, which cannot be compressed further. This single-digit number is called the minimal compressed number.

Example: For the number 86  
- First compression: 8 + 6 = 14  
- Second compression: 1 + 4 = 5  
Thus, the minimal compressed number of 86 is 5.

Given a positive integer N, find its minimal compressed number.

## Input
A positive integer N

## Output
The minimal compressed number corresponding to N

## Sample Input
111

## Sample Output
3

## Sample Input
57871

## Sample Output
1
