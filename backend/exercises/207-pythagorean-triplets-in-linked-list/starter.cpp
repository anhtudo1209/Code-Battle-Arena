#include <iostream>
#include <vector>
#include <cmath>
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

// TODO: Find and print all Pythagorean triplets (a, b, c) where a^2 + b^2 = c^2
// You are given the head of the Linked List.
// Expected output format per triplet: (a, b, c) 
// Note: You can print a space after every triplet.

void findPythagoreanTriplets(Node* head) {
    // Hint: You might need nested loops to check combinations of three nodes.
    // Be careful not to compare a node with itself if the problem implies distinct elements.
    
    // Your code here:

    

}

// ======================================
//         Do NOT modify below
// ======================================

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
    int n;
    if (cin >> n) {
        Node* head = nullptr;
        for (int i = 0; i < n; i++) {
            int val;
            cin >> val;
            append(&head, val);
        }

        findPythagoreanTriplets(head);
    }
    return 0;
}