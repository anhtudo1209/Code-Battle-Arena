#include <iostream>
using namespace std;

// ======================================
//        Do NOT modify above
// ======================================

struct Node {
    int data;
    Node* next;
};

// Create a linked list from input
Node* createList(int n) {
    Node* head = nullptr;
    Node* tail = nullptr;

    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;

        Node* temp = new Node;
        temp->data = x;
        temp->next = nullptr;

        if (head == nullptr) {
            head = tail = temp;
        } else {
            tail->next = temp;
            tail = temp;
        }
    }
    return head;
}

// ======================================
//   TODO: WRITE YOUR CODE BELOW ONLY
// ======================================

// Recursive or iterative GCD function
int gcd(int a, int b) {
    // Your code here


}

// Find and print all co-prime pairs using Linked List
void findCoprimePairs(Node* head) {
    // Your code here

    
}

// ======================================
//        Do NOT modify below
// ======================================
int main() {
    int n;
    cin >> n;

    Node* head = createList(n);

    findCoprimePairs(head);

    return 0;
}
