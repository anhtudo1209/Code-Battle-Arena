#include <iostream>
#include <vector>

using namespace std;

// =================================================================
// STUDENT CODE SECTION
// Implement the NumArray class.
// =================================================================

class NumArray {
private:
    // TODO: Declare a container (e.g., vector or array) to store prefix sums
    vector<int> prefixSums;

public:
    /**
     * Constructor to pre-process the array.
     * @param arr  The input array
     * @param size The size of the input array
     */
    NumArray(int* arr, int size) {
        // TODO: Initialize your data structure
        // TODO: Compute prefix sums in O(n)
        // Hint: prefix[i] = prefix[i-1] + arr[i]
    }

    /**
     * Returns the sum of elements from index left to right (inclusive).
     * @param left  Left index
     * @param right Right index
     * @return      Sum of the subarray
     */
    int sumRange(int left, int right) {
        // TODO: Calculate range sum using the prefix sums in O(1)
        // Hint: Sum(L, R) = Prefix[R] - Prefix[L-1] (handle boundary conditions)
        return 0; // Placeholder
    }
};

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

    // 3. Instantiate the student's class
    NumArray* obj = new NumArray(arr.data(), n);

    // 4. Read the number of queries
    int q;
    if (cin >> q) {
        // 5. Process each query
        for (int i = 0; i < q; i++) {
            int left, right;
            cin >> left >> right;
            cout << obj->sumRange(left, right) << endl;
        }
    }

    delete obj;
    return 0;
}