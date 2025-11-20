# Electricity Bill

In the year 2112, the country has become an economic powerhouse, but electricity prices are extremely expensive.  
NVE is the only electricity provider in the city where Nam lives.  
They have just increased their rates as follows:

| Usage (kWh)           | Price (VND per kWh) |
|-----------------------|----------------------|
| Tier 1: 1 – 100        | 2000                 |
| Tier 2: 101 – 200      | 3000                 |
| Tier 3: 201 – 300      | 5000                 |
| Tier 4: 301 and above  | 10000                |

**Billing method:**  
- The first 100 kWh cost 2000 VND each  
- The next 100 kWh (101–200) cost 3000 VND each  
- The next 100 kWh (201–300) cost 5000 VND each  
- Any usage above 300 kWh costs 10000 VND each  

**Example:**  
If a household uses 250 kWh, they must pay:  
2000 × 100 + 3000 × 100 + 5000 × 50 = **750000 VND**

This month, Nam’s family used `x` kWh.  
Calculate the amount they must pay.

## Input
A single positive integer `x` (x ≤ 100000) representing the electricity usage in kWh

## Output
A single integer: the total cost the family must pay to NVE

## Sample Input
250

## Sample Output
750000
