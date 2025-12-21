#include <iostream>
using namespace std;

// ======================================
//        Do NOT modify above
// ======================================

struct Node {
    int data;
    Node* next;
};

struct Stack {
    Node* top;
    int size;
};

// Stack functions (Linked List)
void initStack(Stack &s) {
    s.top = nullptr;
    s.size = 0;
}

void push(Stack &s, int x) {
    if (s.size == 3) return; // fixed size stack
    Node* temp = new Node;
    temp->data = x;
    temp->next = s.top;
    s.top = temp;
    s.size++;
}

int pop(Stack &s) {
    if (s.top == nullptr) return -1;
    Node* temp = s.top;
    int val = temp->data;
    s.top = temp->next;
    delete temp;
    s.size--;
    return val;
}

// ======================================
//   TODO: WRITE YOUR CODE BELOW ONLY
// ======================================

// Check if a number is prime
bool isPrime(int x) {
    // Your code here


}

// Find and push three distinct prime factors into stack
void findPrimeFactors(int n, Stack &s) {
    // Your code here
}

// Check if number is sphenic using stack
bool isSphenic(int n) {
    // Your code here
}

// Recursively find and print sphenic numbers from 1 to n
void findSphenicNumbers(int current, int n) {
    // Your code here

    
}

// ======================================
//        Do NOT modify below
// ======================================
int main() {
    int n;
    cin >> n;

    findSphenicNumbers(1, n);

    return 0;
}
