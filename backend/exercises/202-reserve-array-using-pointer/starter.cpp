#include <iostream>
#include <vector>

using namespace std;

// TODO: Implement this function to reverse the array using ONLY pointers.
// You are NOT allowed to use array indexing (e.g., arr[i]).
// You must use pointer arithmetic (e.g., *(start + 1), start++, end--).
void reverseArray(int* start, int* end) {
    // Write your code here
    
    
}

int main() {
    int n;
    // Input size of array
    if (!(cin >> n)) return 0;
    
    vector<int> arr(n);
    
    // Input array elements
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    if (n > 0) {
        // Pass the address of the first and last element
        reverseArray(&arr[0], &arr[n-1]);
    }

    // Output the result
    for(int i = 0; i < n; i++) {
        cout << arr[i] << (i == n-1 ? "" : " ");
    }
    cout << endl;

    return 0;
}