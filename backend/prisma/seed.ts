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
  await prisma.problem.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();

  // 2. Creăm Modulele (Limbajele)
  console.log('📦 Creare Module...');
  const pythonModule = await prisma.module.create({
    data: {
      title: 'Python pentru Începători',
      language: 'python',
      description: 'Un curs complet, de la zero, bazat pe analogii și exemple practice.',
    }
  });

  const cppModule = await prisma.module.create({
    data: {
      title: 'Fundamentele C++',
      language: 'cpp',
      description: 'Învață controlul hardware-ului și performanța cu standardul ISO C++.',
    }
  });

  const javaModule = await prisma.module.create({
    data: {
      title: 'Java - Programare Structurată',
      language: 'java',
      description: 'Stăpânește universul Java, de la sintaxă la metode de clasă.',
    }
  });

  // 3. LECȚII PYTHON (8 MODULE DETALIATE)
  console.log('📚 Creare Lecții Python...');

  // L1: Variables and Data Types
  const pyL1 = await prisma.lesson.create({
    data: {
      title: '1. Variables and Data Types',
      description: 'Cum stocăm informația în memoria calculatorului folosind variabile.',
      order: 1,
      moduleId: pythonModule.id,
      content: `# Variabile și Tipuri de Date

Imaginează-ți că memoria calculatorului este un depozit imens. Pentru a găsi lucrurile ușor, le punem în cutii etichetate. În programare, aceste cutii se numesc **Variabile**.

### Ce este o Variabilă?
O variabilă are un **nume** (eticheta cutiei) și o **valoare** (ceea ce se află înăuntru). Procesul de a pune o valoare într-o variabilă se numește **atribuire** și se face cu semnul \`=\`.

### Tipurile de Date (Ce punem în cutie?)
1. **Integer (int)**: Numere întregi (ex: 10, -5). Folosite pentru a număra obiecte.
2. **Float**: Numere cu virgulă (ex: 3.14). În cod folosim punctul pentru zecimale.
3. **String (str)**: Texte. Acestea trebuie puse mereu între ghilimele (\`" "\`), altfel Python va crede că sunt nume de variabile.
4. **Boolean (bool)**: Valori logice: \`True\` (Adevărat) sau \`False\` (Fals).

### Cum afișăm datele?
Pentru a vedea conținutul unei variabile pe ecran, folosim funcția \`print()\`.

\`\`\`python
# Exemplu de cod:
nume = "Alex"      # String
varsta = 20        # Integer
inaltime = 1.85    # Float

print(nume)        # Afișează: Alex
print(varsta)      # Afișează: 20
\`\`\`

**Problema:** Creează o variabilă numită \`an_nastere\` (întreg) și una numită \`nume_complet\` (text). Afișează-le pe amândouă folosind \`print()\`.`,
    }
  });

  // L2: Input-Output
  const pyL2 = await prisma.lesson.create({
    data: {
      title: '2. Input-Output, Keywords and Identifiers',
      description: 'Interacțiunea cu utilizatorul și regulile de numire.',
      order: 2,
      moduleId: pythonModule.id,
      content: `# Interacțiunea cu Utilizatorul

Un program devine util când poate "asculta". Dacă \`print()\` este vocea programului, \`input()\` reprezintă urechile lui.

### Funcția input()
Când Python întâlnește \`input()\`, se oprește și așteaptă ca tu să scrii ceva. **Atenție:** Tot ce primește \`input()\` este considerat text (String), chiar dacă scrii un număr.

### Reguli pentru nume (Identifiers)
Nu poți numi o variabilă oricum. Numele:
- Trebuie să înceapă cu o literă.
- Nu poate conține spații (folosim \`_\`).
- Nu poate fi un **Keyword** (cuvânt rezervat de Python, cum este \`if\` sau \`print\`).

\`\`\`python
# Exemplu de cod:
nume_utilizator = input("Cum te cheamă? ")
print("Salutare, " + nume_utilizator)
\`\`\`

**Problema:** Scrie un program care întreabă utilizatorul: "Care este mâncarea ta preferată?". Salvează răspunsul și afișează: "Mâncarea ta favorită este: " urmat de răspunsul dat.`,
    }
  });

  // L3: Operators
  const pyL3 = await prisma.lesson.create({
    data: {
      title: '3. Operators in Python',
      description: 'Calcule matematice și operatorul Modulo.',
      order: 3,
      moduleId: pythonModule.id,
      content: `# Operatori și Calcule

Python este un calculator foarte puternic. Pe lângă adunare (\`+\`) și scădere (\`-\`), avem:
- \`*\` (Înmulțire) și \`/\` (Împărțire).
- \`%\` (**Modulo**): Îți dă restul împărțirii. De exemplu, 7 % 2 este 1.
- \`**\` (Putere): 3 ** 2 înseamnă 3 la puterea a doua.

### Conversia Datelor (Casting)
Dacă vrei să faci calcule cu ce ai citit prin \`input()\`, trebuie să transformi textul în număr folosind \`int()\` sau \`float()\`.

\`\`\`python
# Exemplu de cod:
numar_text = input("Introdu un numar: ")
numar = int(numar_text) # Transformăm în întreg
print(numar * 2)
\`\`\`

**Problema:** Citește lungimea laturii unui pătrat (\`l\`). Calculează și afișează aria acestuia folosind formula: Aria = l * l.`,
    }
  });

  // L4: Decision Making
  const pyL4 = await prisma.lesson.create({
    data: {
      title: '4. Decision-making in Python',
      description: 'Controlul fluxului folosind structura IF-ELSE.',
      order: 4,
      moduleId: pythonModule.id,
      content: `# Luarea Deciziilor (if-else)

Programele pot alege ce cale să urmeze folosind \`if\` (Dacă). Imaginează-ți un semafor: dacă e verde, mergi; altfel, stai.

### Indentarea (Spațiul de aur)
În Python, tot ce se întâmplă în interiorul unui \`if\` trebuie să fie împins la dreapta cu tasta **Tab**. Fără acest spațiu, programul va da eroare.

\`\`\`python
# Exemplu de cod:
nota = int(input("Ce notă ai luat? "))
if nota >= 5:
    print("Ai promovat!")
else:
    print("Trebuie să mai înveți.")
\`\`\`

**Problema:** Citește un număr întreg. Afișează "PAR" dacă restul împărțirii la 2 este 0 și "IMPAR" în caz contrar.`,
    }
  });

  // ... (Repetă procesul pentru restul de 4 lecții Python: Loops, Numbers, Strings, Lists)

  // 4. CREARE PROBLEME (ASOCIATE LECȚIILOR)
  console.log('🧩 Creare Probleme...');

  await prisma.problem.create({
    data: {
      title: 'Variabile și Afișare',
      description: 'Creează variabilele an_nastere și nume_complet și afișează-le.',
      difficulty: 'Easy',
      lessonId: pyL1.id,
      testCases: [
        { input: "", output: "1990\nAlex Popescu" } // Exemplu generic de output așteptat
      ]
    }
  });

  await prisma.problem.create({
    data: {
      title: 'Suma cu Input',
      description: 'Citește două numere și afișează suma lor.',
      difficulty: 'Easy',
      lessonId: pyL2.id,
      testCases: [
        { input: "10\n20", output: "30" }
      ]
    }
  });

  await prisma.problem.create({
    data: {
      title: 'Aria Pătratului',
      description: 'Calculează aria unui pătrat cu latura l citită de la tastatură.',
      difficulty: 'Easy',
      lessonId: pyL3.id,
      testCases: [
        { input: "5", output: "25" }
      ]
    }
  });

  // 5. C++ ȘI JAVA (STRUCTURĂ)
  // Poți continua aici cu lecțiile de C++ și Java folosind același format lung.

  console.log('🎉 Seed Finalizat!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });