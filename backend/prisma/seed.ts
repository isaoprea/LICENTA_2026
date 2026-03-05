import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Pornire Seed - Încărcare Cursuri Detaliate...');

  // 1. Curățăm datele actuale
  console.log('🗑️  Ștergere date existente...');
  await prisma.submission.deleteMany();
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
 // await prisma.user.deleteMany();

  console.log('📦 Creare Module...');
  const pythonModule = await prisma.module.create({
    data: {
      title: 'Python pentru Începători',
      language: 'python',
      description: 'Un curs complet, de la zero, bazat pe analogii și exemple practice.',
      order: 1,
    }
  });

  const cppModule = await prisma.module.create({
    data: {
      title: 'Fundamentele C++',
      language: 'cpp',
      description: 'Învață controlul hardware-ului și performanța cu standardul ISO C++.',
      order: 2,
    }
  });

  const javaModule = await prisma.module.create({
    data: {
      title: 'Java - Programare Structurată',
      language: 'java',
      description: 'Stăpânește universul Java, de la sintaxă la metode de clasă.',
      order: 3,
    }
  });

  const nodeModule = await prisma.module.create({
    data: {
      title: 'JavaScript & Node.js',
      language: 'node',
      description: 'Dezvoltă aplicații dinamice cu JavaScript pe backend și frontend.',
      order: 4,
    }
  });

  // 3. LECȚII PYTHON (8 COMPLETE)
  console.log('📚 Creare Lecții Python...');

  const pyL1 = await prisma.lesson.create({
    data: {
      title: '1. Variabile și Tipuri de Date',
      description: 'Cum stocăm informația în memoria calculatorului folosind variabile.',
      order: 1,
      moduleId: pythonModule.id,
      content: `# Variabile și Tipuri de Date

Imaginează-ți că memoria calculatorului este un depozit imens. Pentru a găsi lucrurile ușor, le punem în cutii etichetate. În programare, aceste cutii se numesc **Variabile**.

### Ce este o Variabilă?
O variabilă are un **nume** (eticheta cutiei) și o **valoare** (ceea ce se află înăuntru). Procesul de a pune o valoare într-o variabilă se numește **atribuire** și se face cu semnul \`=\`.

### Tipurile de Date
- **int**: Numere întregi (ex: 10, -5)
- **float**: Numere cu virgulă (ex: 3.14)
- **str**: Text (ex: "salutare")
- **bool**: Valori logice (True/False)

\`\`\`python
nume = "Alex"
varsta = 20
inaltime = 1.85
print(nume)
\`\`\``,
    }
  });

  const pyL2 = await prisma.lesson.create({
    data: {
      title: '2. Input și Output',
      description: 'Interacțiunea cu utilizatorul și citirea datelor.',
      order: 2,
      moduleId: pythonModule.id,
      content: `# Input și Output

### Funcția input()
Citeste date de la utilizator.

\`\`\`python
nume = input("Cum te cheamă? ")
varsta = input("Câți ani ai? ")
print("Salutare, " + nume)
\`\`\`

### Conversia Datelor
Tot ce citim cu input() este text. Trebuie să convertim:

\`\`\`python
varsta_text = input("Vârstă: ")
varsta = int(varsta_text)
print(varsta + 1)
\`\`\``,
    }
  });

  const pyL3 = await prisma.lesson.create({
    data: {
      title: '3. Operatori Aritmetici',
      description: 'Calcule matematice în Python.',
      order: 3,
      moduleId: pythonModule.id,
      content: `# Operatori Aritmetici

Python poate face calcule precum un calculator:
- \`+\` (Adunare)
- \`-\` (Scădere)
- \`*\` (Înmulțire)
- \`/\` (Împărțire)
- \`%\` (Modulo - restul)
- \`**\` (Putere)

\`\`\`python
a = 10
b = 3
print(a + b)    # 13
print(a % b)    # 1
print(a ** b)   # 1000
\`\`\``,
    }
  });

  const pyL4 = await prisma.lesson.create({
    data: {
      title: '4. Structura IF-ELSE',
      description: 'Luarea deciziilor cu condiții.',
      order: 4,
      moduleId: pythonModule.id,
      content: `# IF-ELSE - Luarea Deciziilor

Programele pot alege ce cale să urmeze folosind \`if\`.

\`\`\`python
nota = int(input("Ce notă? "))
if nota >= 5:
    print("Promovat!")
else:
    print("Corigent")
\`\`\`

### ELIF - Alte condiții
\`\`\`python
if nota >= 9:
    print("Excelent")
elif nota >= 7:
    print("Bine")
else:
    print("Promovat")
\`\`\``,
    }
  });

  const pyL5 = await prisma.lesson.create({
    data: {
      title: '5. Buclele FOR',
      description: 'Repetarea de acțiuni cu FOR.',
      order: 5,
      moduleId: pythonModule.id,
      content: `# Buclele FOR

Uneori trebuie să repetezi o acțiune de mai multe ori.

### Funcția range()
\`range(n)\` generează numere de la 0 la n-1:

\`\`\`python
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

for i in range(1, 6):
    print(i)  # 1, 2, 3, 4, 5

for i in range(0, 10, 2):
    print(i)  # 0, 2, 4, 6, 8
\`\`\``,
    }
  });

  const pyL6 = await prisma.lesson.create({
    data: {
      title: '6. Buclele WHILE',
      description: 'Repetarea pe bază de condiție.',
      order: 6,
      moduleId: pythonModule.id,
      content: `# Buclele WHILE

WHILE repetă o acțiune cât timp o condiție este adevărată.

\`\`\`python
i = 0
while i < 5:
    print(i)
    i = i + 1

# Alte variante
while True:
    raspuns = input("Renunți? (da/nu): ")
    if raspuns == "da":
        break
\`\`\``,
    }
  });

  const pyL7 = await prisma.lesson.create({
    data: {
      title: '7. Listele',
      description: 'Colecții de date și operații cu liste.',
      order: 7,
      moduleId: pythonModule.id,
      content: `# Listele

O listă este o colecție ordonată de elemente.

\`\`\`python
fructe = ["măr", "pară", "cireșă"]
print(fructe[0])     # măr
print(len(fructe))   # 3

fructe.append("orange")   # Adaugă
fructe.remove("măr")      # Șterge
fructe.pop()              # Șterge ultimul

for fruct in fructe:
    print(fruct)
\`\`\``,
    }
  });

  const pyL8 = await prisma.lesson.create({
    data: {
      title: '8. Funcții',
      description: 'Definiție și utilizare de funcții.',
      order: 8,
      moduleId: pythonModule.id,
      content: `# Funcții

O funcție este un bloc reutilizabil de cod.

\`\`\`python
def salutare():
    print("Bună!")

def adunare(a, b):
    return a + b

def mesaj(nume="Prieten"):
    print("Salutare, " + nume)

salutare()
print(adunare(5, 3))    # 8
mesaj("Alex")
\`\`\``,
    }
  });

  // ========== C++ LESSONS ==========
  console.log('📚 Creare Lecții C++...');

  const cppL1 = await prisma.lesson.create({
    data: {
      title: '1. Variabile și Tipuri de Date',
      description: 'Declararea și utilizarea variabilelor în C++.',
      order: 1,
      moduleId: cppModule.id,
      content: `# Variabile și Tipuri în C++

În C++, trebuie să declari tipul fiecărei variabile.

### Tipurile Principale
- \`int\` - Numere întregi
- \`float\` - Numere cu virgulă
- \`double\` - Precizie mai mare
- \`char\` - Un caracter
- \`bool\` - Valori logice
- \`string\` - Text

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int varsta = 25;
    float inaltime = 1.85;
    string nume = "Alex";
    
    cout << "Vârstă: " << varsta << endl;
    return 0;
}
\`\`\``,
    }
  });

  const cppL2 = await prisma.lesson.create({
    data: {
      title: '2. Input și Output',
      description: 'Citirea și afișarea datelor.',
      order: 2,
      moduleId: cppModule.id,
      content: `# Input și Output în C++

- \`cout\` - Afișează pe ecran
- \`cin\` - Citește de la tastatură

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int numar;
    string text;
    
    cout << "Introdu un număr: ";
    cin >> numar;
    
    cout << "Introdu text: ";
    cin >> text;
    
    cout << "Ai introdus: " << numar << " și " << text << endl;
    return 0;
}
\`\`\``,
    }
  });

  const cppL3 = await prisma.lesson.create({
    data: {
      title: '3. Operatori',
      description: 'Operatori aritmetici și logici.',
      order: 3,
      moduleId: cppModule.id,
      content: `# Operatori în C++

C++ suportă toți operatorii standard.

\`\`\`cpp
int a = 10, b = 5;

// Aritmetici
cout << a + b << endl;  // 15
cout << a % b << endl;  // 0
cout << a / b << endl;  // 2

// Comparare
cout << (a > b) << endl;  // 1 (true)
cout << (a == b) << endl; // 0 (false)

// Logici
cout << ((a > 5) && (b < 10)) << endl;  // 1
\`\`\``,
    }
  });

  const cppL4 = await prisma.lesson.create({
    data: {
      title: '4. IF-ELSE',
      description: 'Luarea deciziilor.',
      order: 4,
      moduleId: cppModule.id,
      content: `# IF-ELSE în C++

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int varsta;
    cout << "Vârstă: ";
    cin >> varsta;
    
    if (varsta >= 18) {
        cout << "Adult" << endl;
    } else if (varsta >= 13) {
        cout << "Adolescent" << endl;
    } else {
        cout << "Copil" << endl;
    }
    return 0;
}
\`\`\``,
    }
  });

  const cppL5 = await prisma.lesson.create({
    data: {
      title: '5. Buclele FOR și WHILE',
      description: 'Repetarea de acțiuni.',
      order: 5,
      moduleId: cppModule.id,
      content: `# Buclele în C++

\`\`\`cpp
// FOR
for (int i = 0; i < 5; i++) {
    cout << i << endl;
}

// WHILE
int i = 0;
while (i < 5) {
    cout << i << endl;
    i++;
}

// DO-WHILE - se execută cel puțin o dată
int j = 0;
do {
    cout << j << endl;
    j++;
} while (j < 5);
\`\`\``,
    }
  });

  const cppL6 = await prisma.lesson.create({
    data: {
      title: '6. Array-uri',
      description: 'Lucrul cu array-uri.',
      order: 6,
      moduleId: cppModule.id,
      content: `# Array-uri în C++

\`\`\`cpp
int numere[5] = {1, 2, 3, 4, 5};
string fructe[] = {"măr", "pară"};

cout << numere[0] << endl;   // 1
cout << numere[4] << endl;   // 5

// Iterare
for (int i = 0; i < 5; i++) {
    cout << numere[i] << endl;
}

// Lungime
cout << sizeof(numere) / sizeof(numere[0]) << endl;  // 5
\`\`\``,
    }
  });

  const cppL7 = await prisma.lesson.create({
    data: {
      title: '7. Funcții',
      description: 'Definiție și utilizare de funcții.',
      order: 7,
      moduleId: cppModule.id,
      content: `# Funcții în C++

\`\`\`cpp
#include <iostream>
using namespace std;

int adunare(int a, int b) {
    return a + b;
}

void salutare(string nume) {
    cout << "Salutare, " << nume << endl;
}

int main() {
    int rezultat = adunare(5, 3);
    cout << rezultat << endl;  // 8
    
    salutare("Alex");
    return 0;
}
\`\`\``,
    }
  });

  // ========== JAVA LESSONS ==========
  console.log('📚 Creare Lecții Java...');

  const javaL1 = await prisma.lesson.create({
    data: {
      title: '1. Variabile și Tipuri de Date',
      description: 'Declararea variabilelor în Java.',
      order: 1,
      moduleId: javaModule.id,
      content: `# Variabile și Tipuri în Java

Java este orientat pe obiecte și necesită tipuri explicite.

\`\`\`java
int varsta = 25;
double inaltime = 1.85;
String nume = "Alex";
boolean student = true;

System.out.println("Vârstă: " + varsta);
System.out.println("Nume: " + nume);
\`\`\``,
    }
  });

  const javaL2 = await prisma.lesson.create({
    data: {
      title: '2. Input și Output',
      description: 'Citirea și afișarea datelor.',
      order: 2,
      moduleId: javaModule.id,
      content: `# Input și Output

\`\`\`java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("Introdu un număr: ");
        int numar = scanner.nextInt();
        
        System.out.println("Ai introdus: " + numar);
    }
}
\`\`\``,
    }
  });

  const javaL3 = await prisma.lesson.create({
    data: {
      title: '3. Operatori',
      description: 'Operatori aritmetici și logici.',
      order: 3,
      moduleId: javaModule.id,
      content: `# Operatori în Java

\`\`\`java
int a = 10, b = 5;

System.out.println(a + b);      // 15
System.out.println(a - b);      // 5
System.out.println(a * b);      // 50
System.out.println(a / b);      // 2
System.out.println(a % b);      // 0

System.out.println(a > b);      // true
System.out.println(a == b);     // false
System.out.println((a > 5) && (b < 10));  // true
\`\`\``,
    }
  });

  const javaL4 = await prisma.lesson.create({
    data: {
      title: '4. IF-ELSE',
      description: 'Luarea deciziilor.',
      order: 4,
      moduleId: javaModule.id,
      content: `# IF-ELSE în Java

\`\`\`java
int nota = 8;

if (nota >= 9) {
    System.out.println("Excelent!");
} else if (nota >= 7) {
    System.out.println("Bine!");
} else if (nota >= 5) {
    System.out.println("Promovat");
} else {
    System.out.println("Corigent");
}
\`\`\``,
    }
  });

  const javaL5 = await prisma.lesson.create({
    data: {
      title: '5. Buclele FOR și WHILE',
      description: 'Repetarea de acțiuni.',
      order: 5,
      moduleId: javaModule.id,
      content: `# Buclele în Java

\`\`\`java
// FOR clasic
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}

// WHILE
int i = 0;
while (i < 5) {
    System.out.println(i);
    i++;
}

// Enhanced FOR (for-each)
int[] numere = {1, 2, 3, 4, 5};
for (int num : numere) {
    System.out.println(num);
}
\`\`\``,
    }
  });

  const javaL6 = await prisma.lesson.create({
    data: {
      title: '6. Array-uri și ArrayList',
      description: 'Colecții de date.',
      order: 6,
      moduleId: javaModule.id,
      content: `# Array-uri și ArrayList

\`\`\`java
import java.util.ArrayList;

// Array
int[] numere = {1, 2, 3, 4, 5};

// ArrayList
ArrayList<Integer> lista = new ArrayList<>();
lista.add(10);
lista.add(20);
lista.add(30);

System.out.println(lista.get(0));  // 10
System.out.println(lista.size());  // 3

for (int num : lista) {
    System.out.println(num);
}
\`\`\``,
    }
  });

  const javaL7 = await prisma.lesson.create({
    data: {
      title: '7. Metode',
      description: 'Definiție și utilizare de metode.',
      order: 7,
      moduleId: javaModule.id,
      content: `# Metode în Java

\`\`\`java
public class Main {
    public static int adunare(int a, int b) {
        return a + b;
    }
    
    public static void salutare(String nume) {
        System.out.println("Salutare, " + nume);
    }
    
    public static void main(String[] args) {
        int rezultat = adunare(5, 3);
        System.out.println(rezultat);  // 8
        
        salutare("Alex");
    }
}
\`\`\``,
    }
  });

  // ========== NODE.JS LESSONS ==========
  console.log('📚 Criere Lecții Node.js...');

  const nodeL1 = await prisma.lesson.create({
    data: {
      title: '1. Variabile în JavaScript',
      description: 'var, let și const.',
      order: 1,
      moduleId: nodeModule.id,
      content: `# Variabile în JavaScript

JavaScript este dinamic - nu declari tipuri explicit.

\`\`\`javascript
let varsta = 25;
const nume = "Alex";
var inaltime = 1.85;

console.log("Vârstă: " + varsta);
console.log(\`Nume: \${nume}\`);  // Template literals
\`\`\``,
    }
  });

  const nodeL2 = await prisma.lesson.create({
    data: {
      title: '2. Operatori',
      description: 'Operatori aritmetici și logici.',
      order: 2,
      moduleId: nodeModule.id,
      content: `# Operatori în JavaScript

\`\`\`javascript
let a = 10, b = 5;

console.log(a + b);        // 15
console.log(a - b);        // 5
console.log(a * b);        // 50
console.log(a / b);        // 2
console.log(a % b);        // 0
console.log(a ** b);       // 100000

console.log(a > b);        // true
console.log(a === "10");   // false
console.log(a == "10");    // true
console.log((a > 5) && (b < 10));  // true
\`\`\``,
    }
  });

  const nodeL3 = await prisma.lesson.create({
    data: {
      title: '3. IF-ELSE',
      description: 'Luarea deciziilor.',
      order: 3,
      moduleId: nodeModule.id,
      content: `# IF-ELSE în JavaScript

\`\`\`javascript
const nota = 8;

if (nota >= 9) {
    console.log("Excelent!");
} else if (nota >= 7) {
    console.log("Bine!");
} else if (nota >= 5) {
    console.log("Promovat");
} else {
    console.log("Corigent");
}

// Ternary operator
let mensaje = nota >= 5 ? "Promovat" : "Corigent";
\`\`\``,
    }
  });

  const nodeL4 = await prisma.lesson.create({
    data: {
      title: '4. Buclele FOR și forEach',
      description: 'Repetarea de acțiuni.',
      order: 4,
      moduleId: nodeModule.id,
      content: `# Buclele în JavaScript

\`\`\`javascript
// FOR clasic
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// WHILE
let i = 0;
while (i < 5) {
    console.log(i);
    i++;
}

// forEach
let numere = [1, 2, 3, 4, 5];
numere.forEach(num => {
    console.log(num);
});

// for...of
for (let num of numere) {
    console.log(num);
}
\`\`\``,
    }
  });

  const nodeL5 = await prisma.lesson.create({
    data: {
      title: '5. Array-uri și Obiecte',
      description: 'Colecții de date.',
      order: 5,
      moduleId: nodeModule.id,
      content: `# Array-uri și Obiecte

\`\`\`javascript
// Array
let fructe = ["măr", "pară", "cireșă"];
console.log(fructe[0]);      // măr
console.log(fructe.length);  // 3

fructe.push("orange");
fructe.pop();

// Obiect
let persoana = {
    nume: "Alex",
    varsta: 25,
    oras: "București"
};

console.log(persoana.nume);      // Alex
console.log(persoana["varsta"]); // 25
\`\`\``,
    }
  });

  const nodeL6 = await prisma.lesson.create({
    data: {
      title: '6. Funcții',
      description: 'Definiție și utilizare.',
      order: 6,
      moduleId: nodeModule.id,
      content: `# Funcții în JavaScript

\`\`\`javascript
// Tradițională
function adunare(a, b) {
    return a + b;
}

// Expression
const inmultire = function(a, b) {
    return a * b;
};

// Arrow function
const scadere = (a, b) => a - b;

console.log(adunare(5, 3));      // 8
console.log(inmultire(4, 5));    // 20
console.log(scadere(10, 7));     // 3
\`\`\``,
    }
  });

  const nodeL7 = await prisma.lesson.create({
    data: {
      title: '7. String-uri',
      description: 'Lucrul cu string-uri.',
      order: 7,
      moduleId: nodeModule.id,
      content: `# String-uri în JavaScript

\`\`\`javascript
let text = "Salutare";

console.log(text.length);          // 8
console.log(text.toUpperCase());   // SALUTARE
console.log(text.toLowerCase());   // salutare
console.log(text.charAt(0));       // S
console.log(text.indexOf("a"));    // 1
console.log(text.substring(0, 3)); // Sal
console.log(text.includes("tar")); // true

let mesaj = \`Bună \${text}\`;
\`\`\``,
    }
  });

  // ========== CREARE PROBLEME LESSON (ONE PER LESSON) ==========
  console.log('🧩 Creare Probleme Lesson (asociate cu lecțiile)...');

  // Python Lesson Problems
  await prisma.problem.createMany({
    data: [
      // Python - 8 probleme (una per lecție)
      {
        title: 'Variabile și tipuri - Python',
        description: 'Creează variabilele an_nastere și nume_complet și afișează-le.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: pyL1.id,
        testCases: [{ input: "", output: "1990\nAlex Popescu" }]
      },
      {
        title: 'Input și Output - Python',
        description: 'Citește un nume și o vârstă, apoi afișează-le.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: pyL2.id,
        testCases: [{ input: "Alex\n25", output: "Salutare, Alex! Vârstă: 25" }]
      },
      {
        title: 'Operatori aritmetici - Python',
        description: 'Citește două numere și calculează suma, diferența și produsul.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: pyL3.id,
        testCases: [{ input: "10\n5", output: "15\n5\n50" }]
      },
      {
        title: 'IF-ELSE - Python',
        description: 'Citește o notă și determină dacă e promovat sau corigent.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: pyL4.id,
        testCases: [{ input: "7", output: "Promovat" }, { input: "4", output: "Corigent" }]
      },
      {
        title: 'Buclele FOR - Python',
        description: 'Afișează tabla înmulțirii pentru un număr folosind FOR.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: pyL5.id,
        testCases: [{ input: "3", output: "3\n6\n9\n12\n15\n18\n21\n24\n27\n30" }]
      },
      {
        title: 'Buclele WHILE - Python',
        description: 'Calculează suma primilor n numere folosind WHILE.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: pyL6.id,
        testCases: [{ input: "5", output: "15" }]
      },
      {
        title: 'Listele - Python',
        description: 'Creează o listă de fructe și afișează-le.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: pyL7.id,
        testCases: [{ input: "", output: "măr\npară\ncireșă\norange" }]
      },
      {
        title: 'Funcții - Python',
        description: 'Definiți o funcție de calcul factorial și testați-o.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: pyL8.id,
        testCases: [{ input: "5", output: "120" }]
      },
      // C++ - 7 probleme
      {
        title: 'Variabile în C++',
        description: 'Declară variabile de diferite tipuri și afișează-le.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: cppL1.id,
        testCases: [{ input: "", output: "Hello, World!" }]
      },
      {
        title: 'Input și Output - C++',
        description: 'Citește un număr și afișează dublul lui.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: cppL2.id,
        testCases: [{ input: "5", output: "10" }]
      },
      {
        title: 'Operatori - C++',
        description: 'Calculează rezultatele operațiilor aritmetice.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: cppL3.id,
        testCases: [{ input: "10\n3", output: "13\n7\n30\n3\n1" }]
      },
      {
        title: 'IF-ELSE - C++',
        description: 'Clasifică vârsta în categorii.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: cppL4.id,
        testCases: [{ input: "20", output: "Adult" }]
      },
      {
        title: 'Buclele FOR și WHILE - C++',
        description: 'Calculează suma de la 1 la N.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: cppL5.id,
        testCases: [{ input: "5", output: "15" }]
      },
      {
        title: 'Array-uri - C++',
        description: 'Lucrează cu array-uri și găsesc valoarea maximă.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: cppL6.id,
        testCases: [{ input: "5", output: "Maximum found" }]
      },
      {
        title: 'Funcții - C++',
        description: 'Definiți funcții de adunare și înmulțire.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: cppL7.id,
        testCases: [{ input: "5\n3", output: "8\n15" }]
      },
      // Java - 7 probleme
      {
        title: 'Variabile în Java',
        description: 'Declară și inițializează variabile de diferite tipuri.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: javaL1.id,
        testCases: [{ input: "", output: "Person created" }]
      },
      {
        title: 'Input și Output - Java',
        description: 'Citește un număr și afișează-l cu mesaj.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: javaL2.id,
        testCases: [{ input: "42", output: "Număr: 42" }]
      },
      {
        title: 'Operatori - Java',
        description: 'Calculează rezultatele operațiilor.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: javaL3.id,
        testCases: [{ input: "10\n5", output: "15\n5\n50\n2\n0" }]
      },
      {
        title: 'IF-ELSE - Java',
        description: 'Clasifică o notă în categorii.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: javaL4.id,
        testCases: [{ input: "8", output: "Bine!" }]
      },
      {
        title: 'Buclele - Java',
        description: 'Afișează primele N numere în ordine.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: javaL5.id,
        testCases: [{ input: "5", output: "1\n2\n3\n4\n5" }]
      },
      {
        title: 'Array-uri și ArrayList - Java',
        description: 'Creează o liste de numere și calculează suma.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: javaL6.id,
        testCases: [{ input: "1 2 3 4 5", output: "15" }]
      },
      {
        title: 'Metode - Java',
        description: 'Definiți și apelați metode simple.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: javaL7.id,
        testCases: [{ input: "5\n3", output: "8" }]
      },
      // Node.js - 7 probleme
      {
        title: 'Variabile în JavaScript',
        description: 'Declară variabile cu let, const și var.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: nodeL1.id,
        testCases: [{ input: "", output: "Variables set" }]
      },
      {
        title: 'Operatori - JavaScript',
        description: 'Calculează rezultatele operațiilor aritmetice.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: nodeL2.id,
        testCases: [{ input: "10\n3", output: "13\n7\n30\n3\n1\n1000" }]
      },
      {
        title: 'IF-ELSE - JavaScript',
        description: 'Clasifică nota cu condiții multiple.',
        difficulty: 'Easy',
        type: 'LESSON',
        lessonId: nodeL3.id,
        testCases: [{ input: "8", output: "Bine!" }]
      },
      {
        title: 'Buclele - JavaScript',
        description: 'Afișează numere folosind for, forEach și for...of.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: nodeL4.id,
        testCases: [{ input: "5", output: "1\n2\n3\n4\n5" }]
      },
      {
        title: 'Array-uri și Obiecte - JavaScript',
        description: 'Lucrează cu array-uri și obiecte simple.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: nodeL5.id,
        testCases: [{ input: "", output: "Data processed" }]
      },
      {
        title: 'Funcții - JavaScript',
        description: 'Definiți funcții tradiționale și arrow functions.',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: nodeL6.id,
        testCases: [{ input: "5\n3", output: "8\n15\n2" }]
      },
      {
        title: 'String-uri - JavaScript',
        description: 'Manipulează string-uri.</description>',
        difficulty: 'Medium',
        type: 'LESSON',
        lessonId: nodeL7.id,
        testCases: [{ input: "hello", output: "HELLO\nH" }]
      },
    ]
  });

  // ========== EXTRA PRACTICE PROBLEMS ==========
  console.log('🧩 Creare Probleme Practice Suplimentare...');

  await prisma.problem.createMany({
    data: [
      // Python Practice
      {
        title: 'Suma Cifrelor',
        description: 'Se dă un număr întreg n. Calculează suma cifrelor sale.',
        difficulty: 'Medium',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "123", output: "6" }, { input: "505", output: "10" }]
      },
      {
        title: 'Palindrom String',
        description: 'Verifică dacă un șir este palindrom.',
        difficulty: 'Medium',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "capac", output: "True" }, { input: "avion", output: "False" }]
      },
      {
        title: 'CMMDC - Euclid',
        description: 'Calculează CMMDC a două numere folosind algoritmul lui Euclid.',
        difficulty: 'Hard',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "12\n18", output: "6" }, { input: "7\n13", output: "1" }]
      },
      {
        title: 'Fibonacci Sequence',
        description: 'Afișează primii n numere Fibonacci.',
        difficulty: 'Hard',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "5", output: "1\n1\n2\n3\n5" }]
      },
      {
        title: 'Numbers Reversed',
        description: 'Inversează ordinea cifrelor unui număr.',
        difficulty: 'Medium',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "12345", output: "54321" }]
      },
      {
        title: 'Prime Number Check',
        description: 'Verifică dacă un număr este prim.',
        difficulty: 'Medium',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "7", output: "True" }, { input: "10", output: "False" }]
      },
      {
        title: 'String Frequency',
        description: 'Contează frecvența unui caracter într-un string.',
        difficulty: 'Medium',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "hello a", output: "2" }]
      },
      {
        title: 'Array Sum',
        description: 'Calculează suma tuturor elementelor din array.',
        difficulty: 'Easy',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "1 2 3 4 5", output: "15" }]
      },
      {
        title: 'Min Max Array',
        description: 'Găsește min și max dintr-un array.',
        difficulty: 'Medium',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "3 7 2 9 1", output: "1 9" }]
      },
      {
        title: 'Sorting Numbers',
        description: 'Sortează un array de numere în ordine crescătoare.',
        difficulty: 'Medium',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "5 2 8 1 9", output: "1 2 5 8 9" }]
      },
      {
        title: 'Matrix Transpose',
        description: 'Transpune o matrice.',
        difficulty: 'Hard',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "3", output: "transposed" }]
      },
      {
        title: 'String Anagram',
        description: 'Verifică dacă două stringuri sunt anagrame.',
        difficulty: 'Medium',
        type: 'PRACTICE',
        lessonId: null,
        testCases: [{ input: "listen\nenlist", output: "True" }]
      },
    ]
  });

  await prisma.channel.createMany({
    data: [
      { name: 'anunturi' },      
      { name: 'general' },       
      { name: 'ajutor-python' },
      { name: 'cpp-zone' },
      { name: 'java-mastery' },
      { name: 'node-backend' },
      { name: 'ajutor-tehnic' }
            
    ],
    skipDuplicates: true
  });

    console.log("Seed finalizat cu succes.");

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });