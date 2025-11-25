#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// =================================================================
// Implement the partition and quickSort functions below.
// =================================================================

/**
 * Main Quick Sort function.
 * * @param arr  The array to sort
 * @param low  Starting index
 * @param high Ending index
 */
void quickSort(int *arr, int low, int high) {
    // TODO: Base case check
    // TODO: Get partition index
    // TODO: Recursively call quickSort on left and right subarrays
}
/**
 * Helper function to partition the array around a pivot.
 * The pivot should be placed in its correct sorted position.
 * Elements smaller than pivot go left, elements greater go right.
 * * @param arr  The array to sort
 * @param low  Starting index
 * @param high Ending index
 * @return     The partition index
 */
int partition(int *arr, int low, int high) {
    // TODO: Select a pivot (e.g., arr[high])
    // TODO: Rearrange elements based on the pivot
    // TODO: Return the final index of the pivot
    return -1; // Placeholder return
}
// =================================================================
// DRIVER CODE (DO NOT EDIT BELOW THIS LINE)
// This code handles input/output for the auto-grader.
// =================================================================

int main() {
    // 1. Read the size of the array
    int n;
    if (!(cin >> n)) return 0;

    // 2. Read the array elements
    // Using a vector for memory management, but passing .data() 
    // to match the 'int *arr' signature.
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    // 3. Call the user's sort function
    // We pass 0 and n-1 as the initial low and high indices.
    if (n > 0) {
        quickSort(arr.data(), 0, n - 1);
    }

    // 4. Print the sorted array for the checker to verify
    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;

    return 0;
}