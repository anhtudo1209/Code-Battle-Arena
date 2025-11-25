#include <iostream>
using namespace std;

// ======================================
//        Do NOT modify above
// ======================================

// TODO: Implement recursive Selection Sort (use iteration if needed)
void recursiveSelectionSort(int arr[], int n, int index) {

    // Your code here

}
// (Optional) You may add helper functions here
// Example:
// int findMinIndex(int arr[], int start, int n) { ... }

// ======================================
//        Do NOT modify below
// ======================================
int main() {
    int n;
    cin >> n;

    int arr[1000];
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    recursiveSelectionSort(arr, n, 0);

    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }

    return 0;
}
