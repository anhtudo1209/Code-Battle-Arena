#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// ======================================
//        Do NOT modify above
// ======================================

// Check if a number is prime
bool isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}

// Find the two largest divisors of n (d1 * d2 = n)
void findTwoLargestDivisors(int n, int &d1, int &d2) {
    d1 = 1;
    d2 = n;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            d1 = i;
            d2 = n / i;
        }
    }
}

// ======================================
//   TODO: WRITE YOUR CODE BELOW ONLY
// ======================================

// Divide & Conquer prime factorization
void factorize(int n, vector<int> &factors) {
    // Your code here

    
}

// ======================================
//        Do NOT modify below
// ======================================
int main() {
    int n;
    cin >> n;

    vector<int> factors;
    factorize(n, factors);

    sort(factors.begin(), factors.end());
    for (int x : factors) cout << x << " ";

    return 0;
}
