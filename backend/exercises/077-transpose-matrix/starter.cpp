#include <iostream>
using namespace std;

// ======================================
//        Do NOT modify above
// ======================================

// TODO: Implement this function
// matrix is MxN, return pointer to NxM transpose (dynamic)
int** transpose(int **matrix, int M, int N) {
    // Your code here
    

}

// ======================================
//        Do NOT modify below
// ======================================
int main() {
    int M, N;
    cin >> M >> N;

    // allocate input matrix
    int **matrix = new int*[M];
    for (int i = 0; i < M; i++) {
        matrix[i] = new int[N];
        for (int j = 0; j < N; j++) {
            cin >> matrix[i][j];
        }
    }

    int **ans = transpose(matrix, M, N);

    // print transpose (NxM)
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < M; j++) {
            cout << ans[i][j] << " ";
        }
        cout << "\n";
    }

    return 0;
}
