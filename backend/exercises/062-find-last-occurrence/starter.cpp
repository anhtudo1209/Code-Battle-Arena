#include <iostream>
using namespace std;

/*
    Find the last occurrence of target in a sorted array.
    You may modify ONLY inside this function.
*/
int findLast(int *arr, int size, int target) {
    // TODO: Implement using binary search
    
    return -1;
}

int main() {
    int size;
    cin >> size;

    int *arr = new int[size];
    for (int i = 0; i < size; i++) {
        cin >> arr[i];
    }

    int target;
    cin >> target;

    cout << findLast(arr, size, target);

    delete[] arr;
    return 0;
}
