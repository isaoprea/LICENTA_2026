import csv
import random
import re
import os

# ============================================================
# PASUL 1 â€” Citim datele existente de pe Codeforces
# ============================================================

def load_existing_csv(path):
    records = []
    if not os.path.exists(path):
        print(f"ATENTIE: {path} nu exista. Continuam doar cu exemplele manuale.")
        return records
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                records.append({
                    'code':            row['code'],
                    'language':        row.get('language', 'unknown'),
                    'logicScore':      float(row['logicScore']),
                    'cleanCodeScore':  float(row['cleanCodeScore']),
                    'efficiencyScore': float(row['efficiencyScore']),
                    'versatilityScore':float(row['versatilityScore']),
                })
            except:
                continue
    return records

print("Citim training_data.csv existent (Codeforces)...")
codeforces_data = load_existing_csv('data/processed/training_data.csv')
print(f"  Gasit: {len(codeforces_data)} exemple Codeforces")

# ============================================================
# PASUL 2 â€” Exemplele manuale de calitate inalta
# Acestea invata modelul ce inseamna cod EXCELENT
# (lipsesc din Codeforces unde codul e de concurs, fara doc)
# ============================================================

quality_examples = []

def add(code, lang, logic, clean, efficiency, versatility, repeat=1):
    for _ in range(repeat):
        quality_examples.append({
            'code': code.strip(),
            'language': lang,
            'logicScore': logic,
            'cleanCodeScore': clean,
            'efficiencyScore': efficiency,
            'versatilityScore': versatility,
        })

# ============================================================
# PYTHON EXCELENT â€” repeta de 15x ca sa contrabalanseze
# miile de exemple Codeforces fara documentatie
# ============================================================

add("""
def binary_search(sorted_array, target):
    \"\"\"
    Cauta un element intr-un tablou sortat folosind cautare binara.
    Complexitate: O(log n)
    
    Args:
        sorted_array: lista sortata
        target: valoarea cautata
    Returns:
        indexul elementului sau -1
    \"\"\"
    left_index = 0
    right_index = len(sorted_array) - 1
    
    while left_index <= right_index:
        middle_index = left_index + (right_index - left_index) // 2
        if sorted_array[middle_index] == target:
            return middle_index
        elif sorted_array[middle_index] < target:
            left_index = middle_index + 1
        else:
            right_index = middle_index - 1
    return -1
""", 'Python', 9.0, 9.5, 9.5, 8.5, repeat=1500)

add("""
def merge_sort(array):
    \"\"\"
    Sorteaza o lista folosind Merge Sort.
    Complexitate: O(n log n)
    
    Args:
        array: lista de sortat
    Returns:
        lista sortata
    \"\"\"
    if len(array) <= 1:
        return array
    
    middle = len(array) // 2
    left_half = merge_sort(array[:middle])
    right_half = merge_sort(array[middle:])
    
    return merge_sorted_halves(left_half, right_half)

def merge_sorted_halves(left, right):
    \"\"\"Combina doua liste sortate intr-una singura.\"\"\"
    merged = []
    left_ptr = 0
    right_ptr = 0
    
    while left_ptr < len(left) and right_ptr < len(right):
        if left[left_ptr] <= right[right_ptr]:
            merged.append(left[left_ptr])
            left_ptr += 1
        else:
            merged.append(right[right_ptr])
            right_ptr += 1
    
    merged.extend(left[left_ptr:])
    merged.extend(right[right_ptr:])
    return merged
""", 'Python', 9.5, 9.5, 9.5, 9.0, repeat=1500)

add("""
class Stack:
    \"\"\"
    Implementare Stack (LIFO) cu operatii standard.
    \"\"\"
    
    def __init__(self):
        \"\"\"Initializeaza un stack gol.\"\"\"
        self.elements = []
    
    def push(self, element):
        \"\"\"Adauga element pe varf.\"\"\"
        self.elements.append(element)
    
    def pop(self):
        \"\"\"Elimina si returneaza elementul de pe varf.\"\"\"
        if self.is_empty():
            raise IndexError("Stack-ul este gol")
        return self.elements.pop()
    
    def peek(self):
        \"\"\"Returneaza varful fara sa il elimine.\"\"\"
        if self.is_empty():
            raise IndexError("Stack-ul este gol")
        return self.elements[-1]
    
    def is_empty(self):
        \"\"\"Verifica daca stack-ul e gol.\"\"\"
        return len(self.elements) == 0
    
    def size(self):
        \"\"\"Returneaza numarul de elemente.\"\"\"
        return len(self.elements)
""", 'Python', 9.0, 10.0, 8.5, 10.0, repeat=1500)

add("""
def sieve_of_eratosthenes(upper_limit):
    \"\"\"
    Gaseste toate numerele prime pana la limita data.
    Complexitate: O(n log log n)
    
    Args:
        upper_limit: limita superioara
    Returns:
        lista cu toate numerele prime
    \"\"\"
    if upper_limit < 2:
        return []
    
    is_prime = [True] * (upper_limit + 1)
    is_prime[0] = False
    is_prime[1] = False
    
    current = 2
    while current * current <= upper_limit:
        if is_prime[current]:
            for multiple in range(current * current, upper_limit + 1, current):
                is_prime[multiple] = False
        current += 1
    
    return [num for num in range(2, upper_limit + 1) if is_prime[num]]
""", 'Python', 9.0, 9.5, 9.5, 8.5, repeat=1500)

add("""
def validate_brackets(expression):
    \"\"\"
    Verifica daca parantezele sunt echilibrate.
    
    Args:
        expression: sirul de verificat
    Returns:
        True daca e valid, False altfel
    \"\"\"
    opening = {'(', '[', '{'}
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    
    for char in expression:
        if char in opening:
            stack.append(char)
        elif char in pairs:
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    
    return len(stack) == 0
""", 'Python', 9.0, 9.5, 8.5, 8.5, repeat=1500)

add("""
def count_word_frequency(text):
    \"\"\"
    Numara frecventa fiecarui cuvant.
    
    Args:
        text: textul de analizat
    Returns:
        dictionar {cuvant: frecventa}
    \"\"\"
    cleaned = text.lower().strip()
    words = cleaned.split()
    
    frequency = {}
    for word in words:
        frequency[word] = frequency.get(word, 0) + 1
    
    return frequency
""", 'Python', 7.5, 9.0, 8.5, 8.0, repeat=1500)

add("""
def quicksort(array):
    \"\"\"
    Sorteaza lista folosind QuickSort.
    Complexitate medie: O(n log n)
    
    Args:
        array: lista de sortat
    Returns:
        lista sortata
    \"\"\"
    if len(array) <= 1:
        return array
    
    pivot = array[len(array) // 2]
    smaller = [x for x in array if x < pivot]
    equal = [x for x in array if x == pivot]
    larger = [x for x in array if x > pivot]
    
    return quicksort(smaller) + equal + quicksort(larger)
""", 'Python', 9.0, 9.0, 9.0, 8.0, repeat=1500)

add("""
def calculate_fibonacci(count):
    \"\"\"
    Genereaza sirul Fibonacci folosind programare dinamica.
    
    Args:
        count: numarul de termeni
    Returns:
        lista cu primii termeni Fibonacci
    \"\"\"
    if count <= 0:
        return []
    if count == 1:
        return [0]
    
    fibonacci = [0, 1]
    
    for position in range(2, count):
        next_term = fibonacci[position - 1] + fibonacci[position - 2]
        fibonacci.append(next_term)
    
    return fibonacci
""", 'Python', 8.0, 9.0, 9.0, 7.5, repeat=1500)

# ============================================================
# PYTHON MEDIU â€” cod fara documentatie dar corect
# ============================================================
add("""
def search(arr, x):
    # cautare binara simpla
    l, r = 0, len(arr) - 1
    while l <= r:
        m = (l + r) // 2
        if arr[m] == x: return m
        elif arr[m] < x: l = m + 1
        else: r = m - 1
    return -1
""", 'Python', 7.0, 5.0, 9.0, 5.0, repeat=700)

add("""
def is_prime(n):
    if n < 2: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True
""", 'Python', 6.0, 4.5, 7.5, 5.0, repeat=700)

add("""
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
""", 'Python', 5.5, 4.0, 9.0, 4.5, repeat=700)

add("""
def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result
""", 'Python', 7.5, 5.0, 7.0, 6.0, repeat=700)

# ============================================================
# PYTHON SLAB â€” cod de concurs tipic fara calitate
# ============================================================
add("""
n=int(input())
a=list(map(int,input().split()))
s=0
for i in range(n):
    s+=a[i]
print(s/n)
""", 'Python', 3.5, 1.5, 5.5, 1.5, repeat=10)

add("""
def f(x,y,z):
    r=0
    for i in range(x):
        for j in range(y):
            for k in range(z):
                r+=i*j*k
    return r
""", 'Python', 4.0, 1.0, 2.0, 2.0, repeat=10)

add("""
t=int(input())
for _ in range(t):
    n=int(input())
    a=[int(x) for x in input().split()]
    a.sort()
    print(a[0],a[-1])
""", 'Python', 4.5, 1.5, 6.0, 2.0, repeat=10)

# ============================================================
# C++ EXCELENT
# ============================================================
add("""
/**
 * Binary search in sorted array.
 * Time complexity: O(log n)
 *
 * @param arr Sorted array
 * @param size Array size
 * @param target Value to find
 * @return Index of target or -1
 */
int binarySearch(int arr[], int size, int target) {
    int leftBound = 0;
    int rightBound = size - 1;
    
    while (leftBound <= rightBound) {
        // Prevent integer overflow
        int midPoint = leftBound + (rightBound - leftBound) / 2;
        
        if (arr[midPoint] == target) {
            return midPoint;
        }
        if (arr[midPoint] < target) {
            leftBound = midPoint + 1;
        } else {
            rightBound = midPoint - 1;
        }
    }
    return -1;
}
""", 'C++', 9.0, 9.5, 9.5, 8.0, repeat=1500)

add("""
#include <vector>
/**
 * Sieve of Eratosthenes â€” finds all primes up to n.
 * Time complexity: O(n log log n)
 *
 * @param upperLimit Upper bound
 * @return Vector of prime numbers
 */
std::vector<int> sieveOfEratosthenes(int upperLimit) {
    std::vector<bool> isPrime(upperLimit + 1, true);
    isPrime[0] = isPrime[1] = false;
    
    for (int current = 2; current * current <= upperLimit; current++) {
        if (isPrime[current]) {
            // Mark all multiples as composite
            for (int multiple = current * current;
                 multiple <= upperLimit;
                 multiple += current) {
                isPrime[multiple] = false;
            }
        }
    }
    
    std::vector<int> primes;
    for (int num = 2; num <= upperLimit; num++) {
        if (isPrime[num]) primes.push_back(num);
    }
    return primes;
}
""", 'C++', 9.0, 9.5, 9.5, 8.5, repeat=1500)

add("""
/**
 * Node for a singly linked list.
 */
struct ListNode {
    int value;
    ListNode* next;
    ListNode(int val) : value(val), next(nullptr) {}
};

/**
 * Reverses a linked list in-place.
 * Time: O(n), Space: O(1)
 *
 * @param head Head of the list
 * @return New head after reversal
 */
ListNode* reverseList(ListNode* head) {
    ListNode* previous = nullptr;
    ListNode* current = head;
    
    while (current != nullptr) {
        ListNode* nextNode = current->next;
        current->next = previous;
        previous = current;
        current = nextNode;
    }
    return previous;
}
""", 'C++', 9.0, 9.5, 9.5, 8.5, repeat=1500)

add("""
#include <stdexcept>
/**
 * Generic Stack using dynamic array.
 */
template <typename T>
class Stack {
private:
    T* data;
    int topIndex;
    int capacity;
    
    void resize() {
        capacity *= 2;
        T* newData = new T[capacity];
        for (int i = 0; i <= topIndex; i++) newData[i] = data[i];
        delete[] data;
        data = newData;
    }
    
public:
    Stack(int cap = 16) : topIndex(-1), capacity(cap) {
        data = new T[capacity];
    }
    
    ~Stack() { delete[] data; }
    
    void push(T element) {
        if (topIndex == capacity - 1) resize();
        data[++topIndex] = element;
    }
    
    T pop() {
        if (isEmpty()) throw std::underflow_error("Stack is empty");
        return data[topIndex--];
    }
    
    T peek() const {
        if (isEmpty()) throw std::underflow_error("Stack is empty");
        return data[topIndex];
    }
    
    bool isEmpty() const { return topIndex == -1; }
    int size() const { return topIndex + 1; }
};
""", 'C++', 9.5, 10.0, 9.0, 10.0, repeat=1500)

add("""
#include <vector>
#include <algorithm>
/**
 * Merge sort implementation.
 * Time: O(n log n), Space: O(n)
 */
std::vector<int> mergeSort(std::vector<int> arr) {
    if (arr.size() <= 1) return arr;
    
    int mid = arr.size() / 2;
    std::vector<int> left(arr.begin(), arr.begin() + mid);
    std::vector<int> right(arr.begin() + mid, arr.end());
    
    left = mergeSort(left);
    right = mergeSort(right);
    
    // Merge the two sorted halves
    std::vector<int> merged;
    int leftIdx = 0, rightIdx = 0;
    
    while (leftIdx < left.size() && rightIdx < right.size()) {
        if (left[leftIdx] <= right[rightIdx]) {
            merged.push_back(left[leftIdx++]);
        } else {
            merged.push_back(right[rightIdx++]);
        }
    }
    
    while (leftIdx < left.size()) merged.push_back(left[leftIdx++]);
    while (rightIdx < right.size()) merged.push_back(right[rightIdx++]);
    
    return merged;
}
""", 'C++', 9.5, 9.5, 9.5, 9.0, repeat=1500)

# ============================================================
# C++ MEDIU
# ============================================================
add("""
// binary search
int search(int arr[], int n, int x) {
    int l = 0, r = n - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == x) return m;
        if (arr[m] < x) l = m + 1;
        else r = m - 1;
    }
    return -1;
}
""", 'C++', 7.0, 5.5, 9.0, 5.0, repeat=700)

add("""
#include <vector>
void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}
""", 'C++', 6.0, 5.0, 4.5, 5.0, repeat=700)

add("""
bool isPalindrome(std::string s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;
        left++; right--;
    }
    return true;
}
""", 'C++', 7.0, 5.0, 8.5, 5.0, repeat=700)

# ============================================================
# C++ SLAB
# ============================================================
add("""
int f(int a[],int n,int x){
int l=0,r=n-1;
while(l<=r){int m=(l+r)/2;
if(a[m]==x)return m;
if(a[m]<x)l=m+1;
else r=m-1;}return -1;}
""", 'C++', 5.0, 1.0, 8.5, 2.0, repeat=10)

add("""
void s(int a[],int n){
for(int i=0;i<n;i++)
for(int j=0;j<n-i-1;j++)
if(a[j]>a[j+1]){int t=a[j];a[j]=a[j+1];a[j+1]=t;}}
""", 'C++', 4.5, 1.0, 3.5, 2.0, repeat=10)

add("""
int main(){int n;cin>>n;
int a[1000];
for(int i=0;i<n;i++)cin>>a[i];
int s=0;
for(int i=0;i<n;i++)s+=a[i];
cout<<s;}
""", 'C++', 3.5, 1.0, 6.0, 1.5, repeat=10)

# ============================================================
# JAVA EXCELENT
# ============================================================
add("""
/**
 * Binary search implementation.
 * Time complexity: O(log n)
 */
public class BinarySearch {
    
    /**
     * Searches for target in sorted array.
     * @param sortedArray Sorted input array
     * @param target Value to find
     * @return Index of target, or -1 if absent
     */
    public static int search(int[] sortedArray, int target) {
        int leftBound = 0;
        int rightBound = sortedArray.length - 1;
        
        while (leftBound <= rightBound) {
            int midPoint = leftBound + (rightBound - leftBound) / 2;
            
            if (sortedArray[midPoint] == target) {
                return midPoint;
            } else if (sortedArray[midPoint] < target) {
                leftBound = midPoint + 1;
            } else {
                rightBound = midPoint - 1;
            }
        }
        return -1;
    }
}
""", 'Java', 9.0, 9.5, 9.5, 8.5, repeat=1500)

add("""
import java.util.ArrayList;
import java.util.List;

/**
 * Prime number finder using Sieve of Eratosthenes.
 */
public class PrimeSieve {
    
    /**
     * Finds all primes up to upperLimit.
     * Time: O(n log log n)
     * @param upperLimit Search boundary
     * @return List of prime numbers
     */
    public static List<Integer> findPrimes(int upperLimit) {
        boolean[] isPrime = new boolean[upperLimit + 1];
        for (int i = 2; i <= upperLimit; i++) isPrime[i] = true;
        
        for (int prime = 2; prime * prime <= upperLimit; prime++) {
            if (isPrime[prime]) {
                for (int mult = prime * prime; mult <= upperLimit; mult += prime) {
                    isPrime[mult] = false;
                }
            }
        }
        
        List<Integer> result = new ArrayList<>();
        for (int i = 2; i <= upperLimit; i++) {
            if (isPrime[i]) result.add(i);
        }
        return result;
    }
}
""", 'Java', 9.0, 9.5, 9.5, 9.0, repeat=1500)

add("""
/**
 * Generic Stack implementation using a linked list.
 */
public class Stack<T> {
    
    private static class Node<T> {
        T data;
        Node<T> next;
        Node(T data) { this.data = data; }
    }
    
    private Node<T> top;
    private int stackSize;
    
    /**
     * Pushes element onto the stack.
     * @param element Element to add
     */
    public void push(T element) {
        Node<T> node = new Node<>(element);
        node.next = top;
        top = node;
        stackSize++;
    }
    
    /**
     * Removes and returns top element.
     * @return Top element
     * @throws RuntimeException if stack is empty
     */
    public T pop() {
        if (isEmpty()) throw new RuntimeException("Stack underflow");
        T value = top.data;
        top = top.next;
        stackSize--;
        return value;
    }
    
    public T peek() {
        if (isEmpty()) throw new RuntimeException("Stack is empty");
        return top.data;
    }
    
    public boolean isEmpty() { return stackSize == 0; }
    public int size() { return stackSize; }
}
""", 'Java', 9.5, 10.0, 9.0, 10.0, repeat=1500)

add("""
/**
 * Utility class for string operations.
 */
public class StringUtils {
    
    /**
     * Checks if a string is a palindrome.
     * Case-insensitive, ignores non-alphanumeric chars.
     * @param input String to check
     * @return true if palindrome
     */
    public static boolean isPalindrome(String input) {
        if (input == null || input.isEmpty()) return true;
        
        String cleaned = input.toLowerCase().replaceAll("[^a-z0-9]", "");
        int left = 0;
        int right = cleaned.length() - 1;
        
        while (left < right) {
            if (cleaned.charAt(left) != cleaned.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}
""", 'Java', 8.5, 9.5, 8.5, 8.5, repeat=1500)

# ============================================================
# JAVA MEDIU
# ============================================================
add("""
public class Solution {
    // binary search
    public int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}
""", 'Java', 7.0, 5.5, 8.5, 6.0, repeat=700)

add("""
public class Fibonacci {
    public long compute(int n) {
        if (n <= 1) return n;
        long a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            long temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
}
""", 'Java', 6.5, 5.5, 8.5, 5.5, repeat=700)

add("""
public class ArrayUtils {
    public int[] bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
}
""", 'Java', 6.0, 5.5, 4.5, 5.5, repeat=700)

# ============================================================
# JAVA SLAB
# ============================================================
add("""
public class T{
public static void main(String[] a){
int n=10,s=0;
for(int i=1;i<=n;i++)s+=i;
System.out.println(s);}}
""", 'Java', 3.5, 1.0, 6.0, 1.5, repeat=10)

add("""
public class X{
static int f(int x,int y){
int r=0;
for(int i=0;i<x;i++)
for(int j=0;j<y;j++)r++;
return r;}
public static void main(String[] a){
System.out.println(f(5,5));}}
""", 'Java', 4.5, 1.0, 3.0, 2.0, repeat=10)

add("""
import java.util.*;
public class S{
public static void main(String[] args){
Scanner sc=new Scanner(System.in);
int n=sc.nextInt();int[] a=new int[n];
for(int i=0;i<n;i++)a[i]=sc.nextInt();
int s=0;
for(int i=0;i<n;i++)s+=a[i];
System.out.println(s);}}
""", 'Java', 4.0, 1.0, 6.5, 1.5, repeat=10)

# ============================================================
# PASUL 3 â€” Combinam totul
# ============================================================

print(f"Exemple manuale de calitate: {len(quality_examples)}")

all_data = codeforces_data + quality_examples
random.shuffle(all_data)

print(f"Total combinat: {len(all_data)} exemple")

# ============================================================
# PASUL 4 â€” Salvam
# ============================================================

with open('training_data_final.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=[
        'code', 'language', 'logicScore',
        'cleanCodeScore', 'efficiencyScore', 'versatilityScore'
    ])
    writer.writeheader()
    writer.writerows(all_data)

print("\nSalvat in: training_data_final.csv")
print("\nDistributie limbaje:")
langs = {}
for r in all_data:
    langs[r['language']] = langs.get(r['language'], 0) + 1
for lang, count in sorted(langs.items()):
    print(f"  {lang}: {count} exemple")

print("\nDistributie scoruri:")
for field in ['logicScore', 'cleanCodeScore', 'efficiencyScore', 'versatilityScore']:
    values = [r[field] for r in all_data]
    avg = sum(values) / len(values)
    print(f"  {field}: medie={avg:.1f}, min={min(values)}, max={max(values)}")

print("\nFoloseste training_data_final.csv in train_model.py!")
