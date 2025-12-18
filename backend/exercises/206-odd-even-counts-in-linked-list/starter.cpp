#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

// ======================================
//         Do NOT modify above
// ======================================

// TODO: Given the head of a Linked List representing the digits of a number,
// count the Odd and Even digits.
// You can print the result directly: cout << odds << " " << evens;

void countDigitsInLinkedList(Node* head) {
    int oddCount = 0;
    int evenCount = 0;

    // Your code here:
    // Traverse the linked list using 'head'
    
    
    
    // Output the result
    cout << oddCount << " " << evenCount << endl;
}

// ======================================
//         Do NOT modify below
// ======================================

// Helper to append a digit to the list
void append(Node** head_ref, int new_data) {
    Node* new_node = new Node(new_data);
    if (*head_ref == nullptr) {
        *head_ref = new_node;
        return;
    }
    Node* last = *head_ref;
    while (last->next != nullptr)
        last = last->next;
    last->next = new_node;
}

int main() {
    string n_str;
    if (cin >> n_str) {
        Node* head = nullptr;
        // Convert string input to Linked List of digits
        for (char c : n_str) {
            append(&head, c - '0');
        }
        
        countDigitsInLinkedList(head);
    }
    return 0;
}