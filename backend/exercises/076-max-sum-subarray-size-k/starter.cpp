#include <iostream>
#include <vector>
#include <algorithm> // For std::max

using namespace std;

// =================================================================
// Implement the maxSubarraySumSizeK function below.
// =================================================================

/**
 * Finds the maximum sum of any contiguous subarray of size k.
 * * @param arr  The input array
 * @param size The size of the array
 * @param k    The size of the contiguous subarray
 * @return     The maximum sum
 */
int maxSubarraySumSizeK(int *arr, int size, int k) {
    // TODO: Handle edge cases (e.g., if size < k)
    // TODO: Implement the Sliding Window technique
    // Hint: Calculate sum of first k elements, then slide the window 
    // by subtracting the element going out and adding the element coming in.
    
    return 0; // Placeholder return
}

// =================================================================
// DRIVER CODE (DO NOT EDIT BELOW THIS LINE)
// =================================================================

int main() {
    // 1. Read the size of the array
    int n;
    if (!(cin >> n)) return 0;

    // 2. Read the array elements
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    // 3. Read k
    int k;
    cin >> k;

    // 4. Call the function and print result
    int result = maxSubarraySumSizeK(arr.data(), n, k);
    cout << result << endl;

    return 0;
}