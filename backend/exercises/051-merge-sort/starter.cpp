#include <iostream>
#include <vector>

using namespace std;

// =================================================================
// STUDENT CODE SECTION
// Implement the merge and mergeSort functions below.
// =================================================================

/**
 * Main Merge Sort function.
 * * @param arr   The array to sort
 * @param left  Left index
 * @param right Right index
 */
void mergeSort(int *arr, int left, int right) {
    // TODO: Base case check
    // TODO: Calculate mid point
    // TODO: Recursively call mergeSort on first and second halves
    // TODO: Call merge() to combine the sorted halves
}
/**
 * Helper function to merge two subarrays of arr[].
 * First subarray is arr[left..mid]
 * Second subarray is arr[mid+1..right]
 * * @param arr   The array to sort
 * @param left  Left index
 * @param mid   Middle index
 * @param right Right index
 */
void merge(int *arr, int left, int mid, int right) {
    // TODO: Create temporary arrays for the left and right subarrays
    // TODO: Copy data to temporary arrays
    // TODO: Merge the temporary arrays back into arr[left..right]
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
    // We pass 0 and n-1 as the initial left and right indices.
    if (n > 0) {
        mergeSort(arr.data(), 0, n - 1);
    }

    // 4. Print the sorted array for the checker to verify
    for (int i = 0; i < n; i++) {
        cout << arr[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;

    return 0;
}