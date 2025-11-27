#include <iostream>
#include <vector>
#include <algorithm> // used for sorting in main only

using namespace std;

// TODO: Implement Binary Search using ITERATION (while loop).
// Do NOT use recursion.
int binarySearch(const vector<int>& nums, int target) {
    int left = 0;
    int right = nums.size() - 1;

    // Write your code here
    
    
    return -1; // Placeholder
}

int main() {
    int n, target;
    // Input size
    cin >> n;
    
    vector<int> nums(n);
    // Input sorted array elements
    for(int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Input target to find
    cin >> target;

    // Ensure array is sorted (just in case user inputs random order)
    sort(nums.begin(), nums.end());

    int index = binarySearch(nums, target);
    
    // Output result
    if (index != -1) {
        cout << "Found at index: " << index << endl;
    } else {
        cout << "Not Found" << endl;
    }

    return 0;
}