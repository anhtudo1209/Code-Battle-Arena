#include <iostream>
#include <cstring>
using namespace std;

// ======================================
//        Do NOT modify above
// ======================================

// TODO: Implement this function
int lengthOfLongestSubstring(char *s) {
    // Your code here


}

// ======================================
//        Do NOT modify below
// ======================================
int main() {
    string input;
    cin >> input;

    // convert to char*
    char *s = new char[input.size() + 1];
    strcpy(s, input.c_str());

    int result = lengthOfLongestSubstring(s);
    cout << result;

    return 0;
}
