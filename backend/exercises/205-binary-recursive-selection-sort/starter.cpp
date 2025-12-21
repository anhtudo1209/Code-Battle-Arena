#include <iostream>
using namespace std;

/*
    EXERCISE:
    Improve Selection Sort using Binary Recursion.

    The array is divided into:
    - Sorted Part I (left side)
    - Unsorted Part (middle)
    - Sorted Part II (right side)

    At each step:
    - Find the minimum recursively from the unsorted part
    - Find the maximum recursively from the unsorted part
    - Put the minimum at the end of Sorted Part I
    - Put the maximum at the front of Sorted Part II
*/

// TODO: recursively find index of minimum element in arr[left..right]
int findMin(int arr[], int left, int right) {
    // TODO

    return -1;
}

// TODO: recursively find index of maximum element in arr[left..right]
int findMax(int arr[], int left, int right) {
    // TODO
    return -1;
}

// TODO: implement binary recursive selection sort
void binarySelectionSort(int arr[], int left, int right) {
    // TODO

    
}

int main() {
    int n;
    cin >> n;

    int arr[1000];
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    // TODO: call binarySelectionSort
    binarySelectionSort(arr, 0, n - 1);

    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }

    return 0;
}
