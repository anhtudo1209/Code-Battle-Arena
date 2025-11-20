# Triangle Angles Check

Given three numbers A, B, C, check whether they can be the three angles of a triangle.  
If they are valid angles of a triangle, determine the type of the triangle.

## Input
A single line containing three numbers A, B, C

## Output
- Print 0 if A, B, C cannot form the angles of a triangle  
- If they can form a triangle, print one of the following:  
  - CAN (isosceles)  
  - DEU (equilateral)  
  - VUONG (right-angled)  
  - THUONG (scalene)

## Sample Input
47 43 90

## Sample Output
VUONG

## Sample Input
47 43 80

## Sample Output
0

## Sample Input
47 53 80

## Sample Output
THUONG
