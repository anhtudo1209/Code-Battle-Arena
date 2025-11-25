#include <iostream>
using namespace std;

/*
    Implement Counting Sort.
    You may assume the maximum possible value in the array is 100.
    You may modify ONLY inside this function.
*/
void countingSort(int *arr, int size) {
    // TODO: Implement Counting Sort

    
}

int main() {
    int size;
    cin >> size;

    int *arr = new int[size];
    for (int i = 0; i < size; i++) {
        cin >> arr[i];
    }

    countingSort(arr, size);

    for (int i = 0; i < size; i++) {
        cout << arr[i];
        if (i < size - 1) cout << " ";
    }

    delete[] arr;
    return 0;
}
