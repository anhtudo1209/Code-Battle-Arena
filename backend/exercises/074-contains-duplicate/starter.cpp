#include <iostream>
#include <vector>
#include <algorithm>
#include <unordered_set>

using namespace std;

// =================================================================
// STUDENT CODE SECTION
// Implement the containsDuplicate function below.
// =================================================================

/**
 * Checks if the array contains any duplicate values.
 * @param arr  The input array
 * @param size The size of the array
 * @return     true if duplicates exist, false if all elements are distinct
 */
bool containsDuplicate(int *arr, int size) {
    // TODO: implementation
    // Hint: You can use a hash set (std::unordered_set) or sort the array.
    
    return false; // Placeholder return
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
    // We explicitly print "true" or "false" to match the sample output
    if (containsDuplicate(arr.data(), n)) {
        cout << "true" << endl;
    } else {
        cout << "false" << endl;
    }

    return 0;
}