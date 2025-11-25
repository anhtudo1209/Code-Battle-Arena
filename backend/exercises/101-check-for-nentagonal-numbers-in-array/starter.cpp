#include <iostream>
#include <cmath>
using namespace std;

/*
    Check if a number is pentagonal.
    Students must complete this function.
*/
bool isPentagonal(int x) {
    // TODO: Implement pentagonal check using formula
    
    return false;
}

/*
    Recursively check the array for pentagonal numbers.
    Students must complete this function.
*/
void checkArray(int arr[], int index, int n) {
    // TODO: Print pentagonal numbers using recursion

}

int main() {
    int n;
    cin >> n;

    int* arr = new int[n];
    for (int i = 0; i < n; i++)
        cin >> arr[i];

    checkArray(arr, 0, n);

    delete[] arr;
    return 0;
}
