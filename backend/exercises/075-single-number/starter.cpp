#include <iostream>
#include <vector>

using namespace std;

// =================================================================
// Implement the singleNumber function below.
// =================================================================

/**
 * Finds the element that appears only once in the array.
 * Constraints: Linear runtime complexity O(n) and constant extra space O(1).
 * * @param arr  The input array
 * @param size The size of the array
 * @return     The single element
 */
int singleNumber(int *arr, int size) {
    // TODO: Implement your solution here
    // Hint: Think about bitwise operators (XOR) to solve this in O(1) space.
    
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

    // 3. Call the function and print result
    int result = singleNumber(arr.data(), n);
    cout << result << endl;

    return 0;
}