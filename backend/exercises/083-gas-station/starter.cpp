#include <iostream>
using namespace std;

// ======================================
//        Do NOT modify above
// ======================================

// TODO: Implement this function
int canCompleteCircuit(int *gas, int *cost, int size) {
    // Your code here
    

}

// ======================================
//        Do NOT modify below
// ======================================
int main() {
    int size;
    cin >> size;

    int *gas = new int[size];
    int *cost = new int[size];

    for (int i = 0; i < size; i++) cin >> gas[i];
    for (int i = 0; i < size; i++) cin >> cost[i];

    int result = canCompleteCircuit(gas, cost, size);
    cout << result;

    return 0;
}
