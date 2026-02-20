import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Pornire Seed...');

  // 1. Curățăm datele actuale
  console.log('🗑️  Ștergere date existente...');
  await prisma.submission.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.user.deleteMany();

  // 2. Creăm Module (Limbajele)
  console.log('📦 Creare Module...');
  const pythonModule = await prisma.module.create({
    data: {
      title: 'Python Mastery',
      language: 'python',
      description: 'Învață Python de la zero până la algoritmi avansați.',
    }
  });

  const cppModule = await prisma.module.create({
    data: {
      title: 'C++ Programming',
      language: 'cpp',
      description: 'Limbajul standard pentru performanță și concursuri.',
    }
  });

  // 3. Creăm Lecțiile Python (Curriculum Standard)
  console.log('📚 Creare Lecții Python...');

  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Introducere în Python - Print și Variabile',
      description: 'Primii pași: afișare text și declarare variabile.',
      content: `# Introducere în Python - Print și Variabile

## Ce este Python?

Python este un limbaj de programare foarte ușor de învățat. Dacă vrei să înveți să scrii programe, Python este alegerea perfectă pentru a începe!

Gândește-te la Python ca la o limbă pe care o vorbești cu calculatorul. Tu spui ce vrei, iar calculatorul execută comenzile tale.

## Comenzi și Program

Un **program** este o serie de instrucțiuni pe care le dau calculatorului. Calculatorul le execută una după alta, în ordinea în care le scriu.

## Funcția print() - Afișarea Textului

Cea mai simplă comandă în Python este \`print()\`. Aceasta spune calculatorului:
**"Afișează ceva pe ecran!"**

### Exemplu 1: Textul simplu
\`\`\`python
print("Bun venit la Python!")
\`\`\`

**Output (rezultat):**
\`\`\`
Bun venit la Python!
\`\`\`

### Exemplu 2: Mai mult text
\`\`\`python
print("Mă numesc Alice")
print("Aceasta este prima mea zi cu Python")
print("Sunt foarte enthusiastă!")
\`\`\`

**Output:**
\`\`\`
Mă numesc Alice
Aceasta este prima mea zi cu Python
Sunt foarte enthusiastă!
\`\`\`

**Observație:** Fiecare \`print()\` afișează pe o linie nouă.

### Exemplu 3: Numere
\`\`\`python
print(42)
print(3.14)
print(7)
\`\`\`

**Output:**
\`\`\`
42
3.14
7
\`\`\`

## Variabile - Cutii de Memorie

O **variabilă** este ca o cutie în care stochezi o valoare. I dai cutiei un nume, și mai târziu poți folosi acel nume pentru a accesa ceea ce e în ea.

### Analogie cu viața reală:
Imaginează-ți o cutie etichetată cu "VÂRSTĂ". În ea pui numărul 20. Întotdeauna când ai nevoie să know vârsta, deschizi cutia și iei 20.

### Cum creezi o variabilă în Python:

Sintaxa este:
\`\`\`
nume_variabila = valoare
\`\`\`

### Exemplu 1: Variabilă cu număr
\`\`\`python
varsta = 20
print(varsta)
\`\`\`

**Output:**
\`\`\`
20
\`\`\`

### Exemplu 2: Variabilă cu text (string)
\`\`\`python
nume = "Ion"
print(nume)
\`\`\`

**Output:**
\`\`\`
Ion
\`\`\`

### Exemplu 3: Mai multe variabile
\`\`\`python
nume = "Maria"
varsta = 25
oras = "București"

print(nume)
print(varsta)
print(oras)
\`\`\`

**Output:**
\`\`\`
Maria
25
București
\`\`\`

## Combinarea Textului și Variabilelor

Poți folosi variabile în interiorul \`print()\` pentru a afișa informații dinamice.

### Metoda 1: Concatenare (lipire text)
\`\`\`python
nume = "Ana"
print("Salut, " + nume)
\`\`\`

**Output:**
\`\`\`
Salut, Ana
\`\`\`

### Metoda 2: f-strings (recomandată!)
\`\`\`python
nume = "Alex"
varsta = 30
print(f"Nume: {nume}, Vârstă: {varsta}")
\`\`\`

**Output:**
\`\`\`
Nume: Alex, Vârstă: 30
\`\`\`

## Tipuri de Date

Python recunoaște diferite tipuri de date:

### 1. String (Text)
\`\`\`python
text = "Bună!"
print(text)
\`\`\`

**Notă:** Textul trebuie încadrat în ghilimele: "..." sau '...'

### 2. Integer (Număr întreg)
\`\`\`python
numar = 42
print(numar)
\`\`\`

### 3. Float (Zecimal)
\`\`\`python
pret = 19.99
print(pret)
\`\`\`

### 4. Boolean (Adevărat/Fals)
\`\`\`python
este_soare = True
este_ploaie = False
print(este_soare)
\`\`\`

## Denomirea Variabilelor - Reguli și Bune Practici

### Reguli (obligatorii):
1. **Poți folosi:** litere (a-z, A-Z), cifre (0-9), underscore (_)
2. **Nu poți folosi:** spații, caractere speciale (@, #, etc.)
3. **Nu pot începe cu cifră:** \`2varsta\` este INCORECT

### Exemple corecte:
\`\`\`python
nume_complet = "Ion Popescu"  ✓ Corect
vârsta = 25  ✓ Corect
_varsta = 25  ✓ Corect
varsta2 = 25  ✓ Corect
\`\`\`

### Exemple INCORECTE:
\`\`\`python
1varsta = 25  ✗ Nu poți începe cu cifră
nume complet = "Ion"  ✗ Nu poți folosi spații
nume-complet = "Ion"  ✗ Nu poți folosi cratimă
\`\`\`

## Bune Practici pentru Nume Semnificative

Alege nume care descriu ceea ce variabila stochează:

### RĂU:
\`\`\`python
x = "Ion"
y = 25
z = "București"
\`\`\`

### BUN:
\`\`\`python
nume = "Ion"
varsta = 25
oras = "București"
\`\`\`

## Schimbarea Valorii unei Variabile

O variabilă poate fi reatribuită (o poți schimba):

\`\`\`python
varsta = 20
print(varsta)  # Output: 20

varsta = 21
print(varsta)  # Output: 21
\`\`\`

## Erori Comune - Cum le Evităm

### Eroare 1: Ghilimele Uitate
\`\`\`python
print(Salut)  # ✗ EROARE - Python crede că Salut e o variabilă
print("Salut")  # ✓ CORECT
\`\`\`

### Eroare 2: Variabilă Folosită Fără a fi Definită
\`\`\`python
print(nume)  # ✗ EROARE - nume nu a fost definit
nume = "Ion"
print(nume)  # ✓ CORECT
\`\`\`

### Eroare 3: Ghilimele Incompletele
\`\`\`python
print("Salut)  # ✗ EROARE - ghilimă de deschidere fără închidere
print("Salut")  # ✓ CORECT
\`\`\`

## Citirea Input-ului de la Utilizator

Poți cere utilizatorului să introducă informații cu funcția \`input()\`:

\`\`\`python
nume = input("Care este numele tău? ")
print(f"Bună, {nume}!")
\`\`\`

**Exemple de execuție:**
\`\`\`
Care este numele tău? Ion
Bună, Ion!
\`\`\`

**IMPORTANT:** \`input()\` returnează ÎNTOTDEAUNA un STRING (text), chiar dacă utilizatorul introduce numere!

\`\`\`python
numar = input("Introduceți o vârstă: ")
print(type(numar))  # Output: <class 'str'>
\`\`\`

## Rezumat

1. **print()** - afișează ceva pe ecran
2. **Variabilă** - cutie care stochează o valoare
3. **Tipuri de date** - string, integer, float, boolean
4. **input()** - cere informații de la utilizator
5. **f-strings** - cea mai ușoară cale să combini text cu variabile

## Următorii Pași

Acum că știi cum să creezi variabile și să afișezi informații, ești gata să înveți operații matematice! Următoarea lecție te va învăța cum să aduni, scazi, înmulțești numere.`,
      moduleId: pythonModule.id,
      order: 1
    }
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Operații Aritmetice și Calcule Matematice',
      description: 'Adunări, scăderi, înmulțiri și calcule cu numere în Python.',
      content: `# Operații Aritmetice și Calcule Matematice

## Ce sunt Operații Aritmetice?

O **operație aritmetică** este o operație matematică pe care o faci cu numere: adunare, scădere, înmulțire, împărțire.

## Operatorii Aritmetici Principali

### 1. Adunare (+)
Adună două numere.

\`\`\`python
a = 10
b = 5
rezultat = a + b
print(rezultat)  # Output: 15
\`\`\`

**Alte exemple:**
\`\`\`python
print(3 + 7)      # Output: 10
print(100 + 250)  # Output: 350
print(-5 + 10)    # Output: 5
\`\`\`

### 2. Scădere (-)
Scade un număr din altul.

\`\`\`python
a = 10
b = 3
rezultat = a - b
print(rezultat)  # Output: 7
\`\`\`

**Alte exemple:**
\`\`\`python
print(20 - 8)     # Output: 12
print(5 - 10)     # Output: -5
print(100 - 100)  # Output: 0
\`\`\`

### 3. Înmulțire (*)
Înmulțește două numere.

\`\`\`python
a = 6
b = 4
rezultat = a * b
print(rezultat)  # Output: 24
\`\`\`

**Alte exemple:**
\`\`\`python
print(5 * 3)      # Output: 15
print(10 * 10)    # Output: 100
print(7 * 0)      # Output: 0
\`\`\`

### 4. Împărțire (/)
Împarte un număr la altul. **Rezultatul este ÎNTOTDEAUNA float (zecimal), chiar dacă se împarte exact!**

\`\`\`python
a = 10
b = 2
rezultat = a / b
print(rezultat)  # Output: 5.0
print(type(rezultat))  # Output: <class 'float'>
\`\`\`

**Alte exemple:**
\`\`\`python
print(20 / 4)     # Output: 5.0
print(7 / 2)      # Output: 3.5
print(10 / 3)     # Output: 3.3333...
\`\`\`

### 5. Împărțire Întreagă (//)
Împarte și rotunjește în jos la cel mai apropiat întreg.

\`\`\`python
print(7 / 2)      # Output: 3.5 (împărțire normală)
print(7 // 2)     # Output: 3 (împărțire întreagă)
print(10 // 3)    # Output: 3 (nu 3.333...)
\`\`\`

### 6. Rest de Împărțire (%)
Dă restul împărțirii dintre două numere.

\`\`\`python
print(7 % 2)      # Output: 1 (7 = 2*3 + 1)
print(10 % 3)     # Output: 1 (10 = 3*3 + 1)
print(20 % 5)     # Output: 0 (20 = 5*4 + 0, se împarte exact)
\`\`\`

**Caz de utilizare:** Pentru a verifica dacă un număr este par:
\`\`\`python
numar = 8
if numar % 2 == 0:
    print("Par")
else:
    print("Impar")
\`\`\`

### 7. Exponenți (**)
Ridică un număr la putere.

\`\`\`python
print(2 ** 3)     # Output: 8 (2 la puterea 3)
print(5 ** 2)     # Output: 25 (5 la puterea 2)
print(10 ** 0)    # Output: 1 (orice la puterea 0 = 1)
\`\`\`

## Ordinea Operațiilor (PEMDAS/BODMAS)

Python respectă ordinea matematică standardă:
1. **Paranteze** ()
2. **Exponenți** **
3. **Înmulțire și Împărțire** * / // %
4. **Adunare și Scădere** + -

### Exemplu 1:
\`\`\`python
print(2 + 3 * 4)     # Output: 14 (nu 20)
# De ce? Înmulțirea se face prima: 3*4=12, apoi 2+12=14
\`\`\`

### Exemplu 2:
\`\`\`python
print((2 + 3) * 4)   # Output: 20
# Cu paranteze: mai întâi 2+3=5, apoi 5*4=20
\`\`\`

### Exemplu 3:
\`\`\`python
print(10 - 2 * 3)    # Output: 4
# Înmulțire prima: 2*3=6, apoi 10-6=4
\`\`\`

### Exemplu 4:
\`\`\`python
print(2 ** 3 * 4)    # Output: 32
# Exponenți mai întâi: 2**3=8, apoi 8*4=32
\`\`\`

## Citirea Numerelor de la Utilizator

Reamintire: \`input()\` returnează TEXT, nu număr! Trebuie să convertești:

### Conversie la Integer:
\`\`\`python
varsta_text = input("Introduce-ți vârsta: ")
varsta = int(varsta_text)
anul_viitor = varsta + 1
print(f"Anul viitor vei avea {anul_viitor} ani")
\`\`\`

**Scurtă (varianta obișnuită):**
\`\`\`python
varsta = int(input("Introduce-ți vârsta: "))
print(varsta + 1)
\`\`\`

### Conversie la Float:
\`\`\`python
pret = float(input("Introduce-ți prețul: "))
pret_dublu = pret * 2
print(f"Prețul dublu: {pret_dublu}")
\`\`\`

## Calcule Practice - Exemple Reale

### Exemplu 1: Media a trei numere
\`\`\`python
nota1 = float(input("Introduce-ți nota 1: "))
nota2 = float(input("Introduce-ți nota 2: "))
nota3 = float(input("Introduce-ți nota 3: "))

media = (nota1 + nota2 + nota3) / 3
print(f"Media: {media}")
\`\`\`

### Exemplu 2: Arie de dreptunghi
\`\`\`python
lungime = float(input("Introduce-ți lungimea: "))
latime = float(input("Introduce-ți lățimea: "))

arie = lungime * latime
perimetru = 2 * (lungime + latime)

print(f"Arie: {arie}")
print(f"Perimetru: {perimetru}")
\`\`\`

### Exemplu 3: Schimbare de monedă
\`\`\`python
eur = float(input("Introduce-ți euro: "))
curs = 5.0  # 1 EUR = 5 RON (exemplu)

ron = eur * curs
print(f"{eur} EUR = {ron} RON")
\`\`\`

## Operații cu Variabile

Poți face operații și salva rezultatul într-o variabilă:

\`\`\`python
x = 10
y = 3
suma = x + y
diferenta = x - y
produs = x * y
cat = x / y

print(f"Suma: {suma}")
print(f"Diferență: {diferenta}")
print(f"Produs: {produs}")
print(f"Cât: {cat}")
\`\`\`

## Modificarea unei Variabile

Poți folosi o variabilă în calculul ei însuși:

\`\`\`python
numar = 5
print(numar)      # Output: 5

numar = numar + 1
print(numar)      # Output: 6

numar = numar * 2
print(numar)      # Output: 12
\`\`\`

## Scurtături pentru Operații cu Variabile

Python oferă scurtături practice:

\`\`\`python
x = 10
x += 5      # Echivalent cu: x = x + 5
print(x)    # Output: 15

x -= 3      # Echivalent cu: x = x - 3
print(x)    # Output: 12

x *= 2      # Echivalent cu: x = x * 2
print(x)    # Output: 24

x /= 4      # Echivalent cu: x = x / 4
print(x)    # Output: 6.0
\`\`\`

## Erori Comune

### Eroare 1: Uita string și număr
\`\`\`python
varsta = input("Vârstă: ")
print(varsta + 5)  # ✗ EROARE - nu poți aduna text cu număr
\`\`\`

**Soluție:**
\`\`\`python
varsta = int(input("Vârstă: "))
print(varsta + 5)  # ✓ CORECT
\`\`\`

### Eroare 2: Împărțire la zero
\`\`\`python
print(10 / 0)  # ✗ EROARE - nu poți împărți la zero!
\`\`\`

### Eroare 3: Tipuri mixte fără să vrei
\`\`\`python
print(5 + 2.5)  # Output: 7.5 (integer + float = float, e OK)
\`\`\`

## Rezumat

| Operator | Nume | Exemplu | Rezultat |
|----------|------|---------|----------|
| + | Adunare | 5 + 3 | 8 |
| - | Scădere | 5 - 3 | 2 |
| * | Înmulțire | 5 * 3 | 15 |
| / | Împărțire | 5 / 2 | 2.5 |
| // | Împărțire întreagă | 5 // 2 | 2 |
| % | Rest | 5 % 2 | 1 |
| ** | Exponenți | 2 ** 3 | 8 |

## Următorii Pași

Acum că știi cum să faci calcule, mergi mai departe! Următoarea lecție te va învăța cum să iei DECIZII în cod folosind \`if\`, \`else\` și \`elif\`.`,
      moduleId: pythonModule.id,
      order: 2
    }
  });

  const lesson3 = await prisma.lesson.create({
    data: {
      title: 'Condiții și Luarea Deciziilor',
      description: 'Logică cu if, elif și else - controlul fluxului programului.',
      content: `# Condiții și Luarea Deciziilor

## De Ce Avem Nevoie de Condiții?

În viață, luăm decizii pe baza unor condiții:
- **Dacă** e frig **ATUNCI** pun jacketa
- **Dacă** trec testul **ATUNCI** sunt fericit, **ALTFEL** studiez mai mult

În programare, trebuie să spun calculatorului: "Dacă ceva este adevărat, fă asta; altfel fă aia." Asta fac **condiții**.

## Declarația IF

Cea mai simplă condiție: **dacă ceva este adevărat, execută codul**.

\`\`\`python
varsta = 18

if varsta >= 18:
    print("Ești major!")
\`\`\`

**Cum funcționează:**
1. Verifică: varsta >= 18?
2. Da? Execută cod din interiorul if
3. Nu? Sari peste cod

**Observație:** Codul din IF trebuie indentat (spații la început)!

### Alte Exemple:

\`\`\`python
temperatura = 25

if temperatura > 30:
    print("E foarte cald!")

nota = 7
if nota >= 5:
    print("Ai promovat!")
\`\`\`

## Operatori de Comparație

Trebuie să compari lucruri. Aici sunt operatorii:

| Operator | Sensul | Exemplu | Rezultat |
|----------|--------|---------|----------|
| == | Egal cu | 5 == 5 | True |
| != | Nu egal cu | 5 != 3 | True |
| > | Mai mare decât | 5 > 3 | True |
| < | Mai mic decât | 5 < 3 | False |
| >= | Mai mare sau egal | 5 >= 5 | True |
| <= | Mai mic sau egal | 3 <= 5 | True |

### Exemple:
\`\`\`python
x = 10

print(x == 10)    # Output: True
print(x != 5)     # Output: True
print(x > 7)      # Output: True
print(x < 10)     # Output: False
print(x >= 10)    # Output: True
print(x <= 9)     # Output: False
\`\`\`

## ELSE - Cealaltă Cale

Ce se întâmplă dacă condiția este falsă?

\`\`\`python
varsta = 15

if varsta >= 18:
    print("Ești major!")
else:
    print("Ești minor.")
\`\`\`

**Cum funcționează:**
1. Verific: varsta >= 18?
2. DA? Execut codul din IF
3. NU? Execut codul din ELSE

**Un alt exemplu:**
\`\`\`python
nota = 4

if nota >= 5:
    print("Ai promovat!")
else:
    print("Ai picat, mai studiază.")
\`\`\`

## ELIF - Mai Multe Opțiuni

Dar dacă sunt mai mult de 2 posibilități?

\`\`\`python
varsta = 25

if varsta < 13:
    print("Ești copil.")
elif varsta < 18:
    print("Ești adolescent.")
elif varsta < 65:
    print("Ești adult.")
else:
    print("Ești pensionar.")
\`\`\`

**Cum funcționează:**
1. Verifică prima condiție: varsta < 13? NO → merge mai departe
2. Verifică a doua: varsta < 18? NO → merge mai departe
3. Verifică a treia: varsta < 65? YES → execută și **STOP**
4. else nu se mai execută

**Timp important:** Se execută DOAR PRIMA condiție care e adevărată!

### Alt Exemplu:
\`\`\`python
nota = 7

if nota < 3:
    print("Foarte slab")
elif nota < 5:
    print("Slab")
elif nota < 7:
    print("Bine")
elif nota < 9:
    print("Foarte bine")
else:
    print("Excelent!")
\`\`\`

## Operatori Logici

### AND (ŞI)

Ambele condiții trebuie să fie adevărate:

\`\`\`python
varsta = 25
permis = True

if varsta >= 18 and permis == True:
    print("Poți conduce!")
else:
    print("Nu poți conduce.")
\`\`\`

**Tabel de adevăr pentru AND:**
| A | B | A and B |
|---|---|---------|
| True | True | True |
| True | False | False |
| False | True | False |
| False | False | False |

### OR (SAU)

Cel puțin una din condiții trebuie să fie adevărată:

\`\`\`python
zi = "sâmbată"

if zi == "sâmbată" or zi == "duminică":
    print("Se odihnă!")
else:
    print("Luchez.")
\`\`\`

**Tabel de adevăr pentru OR:**
| A | B | A or B |
|---|---|--------|
| True | True | True |
| True | False | True |
| False | True | True |
| False | False | False |

### NOT (NU)

Inverseaza adevărul:

\`\`\`python
este_ploaie = True

if not este_ploaie:
    print("Ies in parc!")
else:
    print("Raman acasă.")
\`\`\`

## Condiții cu Input

\`\`\`python
nume = input("Care-i numele tău? ")

if nume == "Maria":
    print("Salut Maria!")
elif nume == "John":
    print("Hi John!")
else:
    print(f"Salut {nume}!")
\`\`\`

**O aplicație mai complexă:**
\`\`\`python
x = int(input("Introduceți un număr: "))

if x > 0:
    print("Pozitiv")
elif x < 0:
    print("Negativ")
else:
    print("Zero")
\`\`\`

## Practică - O Aplicație Reală

Sistem de rating pentru filme:

\`\`\`python
rating = float(input("Rating-ul filmului (0-10): "))

if rating >= 8:
    print("Excellent! Trebuie să-l vezi!")
elif rating >= 6:
    print("Bun film, ar vala să-l vezi")
elif rating >= 4:
    print("Acceptabil, dar nu ceva special")
else:
    print("Nu-l recomand")
\`\`\`

## Erori Comune

### Eroare 1: Uită \`==\` pentru comparație

\`\`\`python
x = 5
if x = 5:  # ✗ EROARE - asta înlocuiește valoarea, nu compară!
    print("Egal")
\`\`\`

**Corect:**
\`\`\`python
if x == 5:  # ✓ Compară
    print("Egal")
\`\`\`

### Eroare 2: Indentare greșită

\`\`\`python
x = 5
if x > 3:
print("Mai mare")  # ✗ EROARE - trebuie indentat!
\`\`\`

**Corect:**
\`\`\`python
if x > 3:
    print("Mai mare")  # ✓ Indentat
\`\`\`

### Eroare 3: Uită \`:\` după condiție

\`\`\`python
if x > 5  # ✗ EROARE - lipsește ':'
    print("Mare")
\`\`\`

**Corect:**
\`\`\`python
if x > 5:  # ✓ Cu ':'
    print("Mare")
\`\`\`

## Rezumat

- **if**: Executa cod DACĂ condiție e adevărată
- **elif**: Altă condiție dacă prima e falsă
- **else**: Executa dacă NIMIC din condițiile anterioare nu e adevărat
- **Operatori**: ==, !=, >, <, >=, <=
- **Logică**: and, or, not

## Următorii Pași

Acum știi cum să iei decizii! Dar dacă trebuie să repeți ceva de 100 de ori? Asta e pentru BUCLE - lecția următoare!`,
      moduleId: pythonModule.id,
      order: 3
    }
  });

  const lesson4 = await prisma.lesson.create({
    data: {
      title: 'Bucle: Repetând Acțiuni',
      description: 'Cum repetă programul acțiuni: for și while loops.',
      content: `# Bucle: Repetând Acțiuni

## De Ce Avem Nevoie de Bucle?

Imaginează-ți: trebuie să afișez numerele de la 1 la 100. Fără bucle, ar trebui să scriu:

\`\`\`python
print(1)
print(2)
print(3)
print(4)
...
print(100)
\`\`\`

Asta e obositor! **Buclele** permit repetarea automată a codului.

## Bucla FOR

### Ce este bucla FOR?

O **buclă for** repetă cod pentru fiecare element dintr-o colecție de numere.

### Exemplu Simplu:

\`\`\`python
for i in range(5):
    print(i)
\`\`\`

**Output:**
\`\`\`
0
1
2
3
4
\`\`\`

**Cum funcționează:**
1. Variabila \`i\` ia valorile: 0, 1, 2, 3, 4
2. Pentru fiecare valoare, se execută codul din buclă (print)
3. Când valorile se termină, bucla se termină

### Funcția range()

\`range()\` generează numere. Iată variantele:

**Varianta 1: range(n) - De la 0 la n-1**
\`\`\`python
for i in range(5):
    print(i)  # Output: 0, 1, 2, 3, 4
\`\`\`

**Varianta 2: range(start, end) - De la start la end-1**
\`\`\`python
for i in range(1, 6):
    print(i)  # Output: 1, 2, 3, 4, 5

for i in range(10, 15):
    print(i)  # Output: 10, 11, 12, 13, 14
\`\`\`

**Varianta 3: range(start, end, step) - Cu pas**
\`\`\`python
for i in range(0, 10, 2):
    print(i)  # Output: 0, 2, 4, 6, 8

for i in range(20, 10, -2):
    print(i)  # Output: 20, 18, 16, 14, 12
\`\`\`

### Tabl de Referință pentru range():

| Cod | Output |
|-----|--------|
| range(5) | 0, 1, 2, 3, 4 |
| range(1, 5) | 1, 2, 3, 4 |
| range(0, 10, 2) | 0, 2, 4, 6, 8 |
| range(5, 0, -1) | 5, 4, 3, 2, 1 |

### Exemple Practice cu FOR:

**Exemplu 1: Suma numerelor de la 1 la 5**
\`\`\`python
suma = 0
for i in range(1, 6):
    suma = suma + i
    print(f"Iteratia {i}: suma = {suma}")

print(f"Total: {suma}")
\`\`\`

**Output:**
\`\`\`
Iteratia 1: suma = 1
Iteratia 2: suma = 3
Iteratia 3: suma = 6
Iteratia 4: suma = 10
Iteratia 5: suma = 15
Total: 15
\`\`\`

**Exemplu 2: Tabel de înmulțire**
\`\`\`python
numar = 5
for i in range(1, 11):
    rezultat = numar * i
    print(f"{numar} x {i} = {rezultat}")
\`\`\`

**Output:**
\`\`\`
5 x 1 = 5
5 x 2 = 10
5 x 3 = 15
...
5 x 10 = 50
\`\`\`

## Bucla WHILE

### Ce este bucla WHILE?

O **buclă while** repetă cod **cât timp o condiție este adevărată**.

\`\`\`python
x = 1
while x <= 5:
    print(x)
    x = x + 1
\`\`\`

**Output:**
\`\`\`
1
2
3
4
5
\`\`\`

**Cum funcționează:**
1. Verifică: x <= 5?
2. DA? Execută codul din buclă
3. După fiecare execuție, revine la verificare
4. NU? Ieși din buclă

### Diferența FOR vs WHILE

- **FOR**: Știu **câte** iterații fac (for range(5) = 5 iterații)
- **WHILE**: Nu știu **câte** iterații, doar că se repetă até ce o condiție e falsă

### Exemplu WHILE cu Input:

\`\`\`python
secret = 42
incercari = 0

while True:
    numar = int(input("Ghicește numărul: "))
    incercari = incercari + 1
    
    if numar == secret:
        print(f"Bravo! Ai găsit-o în {incercari} încercări!")
        break
    elif numar < secret:
        print("Prea mic!")
    else:
        print("Prea mare!")
\`\`\`

## BREAK - Ieșirea Forțată din Buclă

**break** OPREȘTE imediat bucla, chiar dacă condiția ar continua.

\`\`\`python
for i in range(10):
    if i == 5:
        break
    print(i)
\`\`\`

**Output:**
\`\`\`
0
1
2
3
4
\`\`\`

Observă: S-a oprit la 5, nu a continuat la 6, 7, etc.

## CONTINUE - Sărind Iterația Curentă

**continue** SARE iterația curentă și merge la următoarea.

\`\`\`python
for i in range(10):
    if i == 5:
        continue
    print(i)
\`\`\`

**Output:**
\`\`\`
0
1
2
3
4
6
7
8
9
\`\`\`

Observă: 5 lipsește! Când i devine 5, s-a sărit cu continue.

## Combinații Practice

### Exemplu 1: Numere Pare și Impare

\`\`\`python
for i in range(1, 11):
    if i % 2 == 0:
        print(f"{i} - Par")
    else:
        print(f"{i} - Impar")
\`\`\`

**Output:**
\`\`\`
1 - Impar
2 - Par
3 - Impar
4 - Par
...
\`\`\`

### Exemplu 2: Números Prim (Simplificat)

\`\`\`python
numar = 17
este_prim = True

if numar < 2:
    este_prim = False
else:
    for i in range(2, numar):
        if numar % i == 0:
            este_prim = False
            break

if este_prim:
    print(f"{numar} este prim")
else:
    print(f"{numar} nu este prim")
\`\`\`

## Erori Comune

### Eroare 1: Bucla Infinită

\`\`\`python
x = 1
while x < 10:
    print(x)
    # EROARE: x nu se schimbă! Infinit!
\`\`\`

**Corect:**
\`\`\`python
x = 1
while x < 10:
    print(x)
    x = x + 1  # ✓ Crește x
\`\`\`

### Eroare 2: Indentare Greșită

\`\`\`python
for i in range(5):
print(i)  # ✗ EROARE - trebuie indentat!
\`\`\`

**Corect:**
\`\`\`python
for i in range(5):
    print(i)  # ✓ Indentat
\`\`\`

### Eroare 3: Confundare cu Variabila

\`\`\`python
i = 5
for i in range(10):
    print(i)

print(i)  # Output: 9 (nu 5!)
# După buclă, i are valoarea finală din buclă
\`\`\`

## Rezumat

- **FOR**: Repetă pentru numere cunoscute (range)
- **WHILE**: Repetă cât timp condiție e adevărată
- **range(n)**: Generează numere de la 0 la n-1
- **break**: OPREȘTE bucla
- **continue**: SARE iterație, merge la următoare
- Atenție la **indentare** și **bucle infinite**

## Următorii Pași

Acum că știi să repeți! Dar ce dacă vrei să stochezi mai mult de o valoare? De aia sunt **liste și stringuri** - lecția următoare!`,
      moduleId: pythonModule.id,
      order: 4
    }
  });

  const lesson5 = await prisma.lesson.create({
    data: {
      title: 'Liste și Stringuri: Colecții de Date',
      description: 'Cum să lucrezi cu colecții de date și text.',
      content: `# Liste și Stringuri: Colecții de Date

## De Ce Avem Nevoie de Liste?

Până acum, am stocat o singură valoare per variabilă:
\`\`\`python
note1 = 8
note2 = 9
note3 = 7
\`\`\`

Dar dacă am 100 de note? Creez 100 de variabile? NU! Folosesc **liste**!

## Ce Este o Listă?

O **listă** e ca un **coș de cumpărături** - ține mai multe obiecte înăuntrul ei.

\`\`\`python
note = [8, 9, 7, 10, 6]
\`\`\`

Singura variabilă \`note\` ține ALL valorile!

## Crearea unei Liste

\`\`\`python
listaPrazie = []                              # Lista goală
numere = [1, 2, 3, 4, 5]                     # Liste de numere
culori = ["roșu", "verde", "albastru"]       # Lista de stringuri
mixte = [1, "text", 3.14, True]              # Poate conține tipuri diferite
\`\`\`

## Accesarea Elementelor (Indexare)

Fiecare element are o **poziție** (index). **În Python, se numără de la 0!**

\`\`\`python
numere = [10, 20, 30, 40, 50]

print(numere[0])   # Output: 10 (prima poziție)
print(numere[1])   # Output: 20 (a doua poziție)
print(numere[4])   # Output: 50 (a cincea poziție)
\`\`\`

**Diagramă vizuală:**
\`\`\`
   Index:   0    1    2    3    4
   Valoare: 10  20  30  40  50
\`\`\`

### Indexare Negativă (De la Coadă)

Puteți conta și de la coadă! -1 = ultimul element.

\`\`\`python
numere = [10, 20, 30, 40, 50]

print(numere[-1])   # Output: 50 (ultimul)
print(numere[-2])   # Output: 40 (penultimul)
print(numere[-5])   # Output: 10 (primul)
\`\`\`

## Lungimea Unei Liste (len)

\`\`\`python
numere = [10, 20, 30, 40, 50]

print(len(numere))   # Output: 5
\`\`\`

## Schimbarea Elementelor

\`\`\`python
numere = [10, 20, 30]

numere[1] = 25       # Schimbă elementul de la index 1

print(numere)        # Output: [10, 25, 30]
\`\`\`

## Adăugarea Elementelor (append)

\`\`\`python
fructe = ["măr", "banana"]

fructe.append("portocală")
print(fructe)        # Output: ["măr", "banana", "portocală"]

fructe.append("lămâie")
print(fructe)        # Output: ["măr", "banana", "portocală", "lămâie"]
\`\`\`

## Inserarea la Poziție Specifică (insert)

\`\`\`python
fructe = ["măr", "portocală"]

fructe.insert(1, "banana")  # Inserează "banana" la index 1

print(fructe)        # Output: ["măr", "banana", "portocală"]
\`\`\`

## Ștergerea Elementelor

### Remove (după valoare)
\`\`\`python
fructe = ["măr", "banana", "portocală"]

fructe.remove("banana")
print(fructe)        # Output: ["măr", "portocală"]
\`\`\`

### Pop (după index)
\`\`\`python
fructe = ["măr", "banana", "portocală"]

fructe.pop(1)        # Elimină elementul la index 1
print(fructe)        # Output: ["măr", "portocală"]

fructe.pop()         # Elimină ultimul element
print(fructe)        # Output: ["măr"]
\`\`\`

## Iterarea prin Listă (cu FOR)

\`\`\`python
fructe = ["măr", "banana", "portocală"]

for fruct in fructe:
    print(fruct)
\`\`\`

**Output:**
\`\`\`
măr
banana
portocală
\`\`\`

### Alternativ: Iterare cu Index

\`\`\`python
fructe = ["măr", "banana", "portocală"]

for i in range(len(fructe)):
    print(f"{i}: {fructe[i]}")
\`\`\`

**Output:**
\`\`\`
0: măr
1: banana
2: portocală
\`\`\`

## Alte Metode Utile

### sort() - Sortare
\`\`\`python
numere = [3, 1, 4, 1, 5, 9]

numere.sort()
print(numere)  # Output: [1, 1, 3, 4, 5, 9]

# Sortare descrescătoare
numere.sort(reverse=True)
print(numere)  # Output: [9, 5, 4, 3, 1, 1]
\`\`\`

### in - Verificare Existență
\`\`\`python
numere = [1, 2, 3, 4, 5]

if 3 in numere:
    print("3 este în listă")  # SE EXECUTĂ

if 10 in numere:
    print("10 este în listă")  # NU se execută
\`\`\`

### count() - Numărarea Apariții
\`\`\`python
numere = [1, 2, 2, 3, 2, 4]

count_2 = numere.count(2)
print(count_2)  # Output: 3
\`\`\`

### index() - Găsirea Poziției
\`\`\`python
culori = ["roșu", "verde", "albastru"]

index = culori.index("verde")
print(index)  # Output: 1
\`\`\`

## STRINGURI - Texte Speciale

### Ce Este un String?

Un **string** este TEXT. Se scrie între ghilimele ("" sau '').

\`\`\`python
text = "Bună lumea"
print(text)
\`\`\`

**Cheia**: Stringurile sunt aproape LISTE de caractere!

## Accesarea Caracterelor dintr-un String

La fel ca listele, stringurile au indexare:

\`\`\`python
text = "Bună"

print(text[0])   # Output: B
print(text[1])   # Output: u
print(text[3])   # Output: ă
print(text[-1])  # Output: ă (ultimul caracter)
\`\`\`

## Lungimea unui String (len)

\`\`\`python
text = "Bună lumea"

print(len(text))  # Output: 10 (inclusiv spațiu)
\`\`\`

## Slicing - Tăierea Stringurilor

Extrage o parte din string:

\`\`\`python
text = "Bună lumea"

print(text[0:4])      # Output: Bună
print(text[5:10])     # Output: lumea
print(text[0:])       # Output: Bună lumea (de la 0 la coadă)
print(text[:4])       # Output: Bună (de la început la 4)
print(text[::2])      # Output: Bnăuea (fiecare al 2-lea caracter)
\`\`\`

## Metode Utile pe Stringuri

### upper() și lower()
\`\`\`python
text = "Bună Lumea"

print(text.upper())   # Output: BUNĂ LUMEA
print(text.lower())   # Output: bună lumea
\`\`\`

### replace()
\`\`\`python
text = "Bună lumea"

text_nou = text.replace("lumea", "Python")
print(text_nou)  # Output: Bună Python
\`\`\`

### split() - Despărțire
\`\`\`python
text = "măr,banana,portocală"

fructe = text.split(",")
print(fructe)  # Output: ['măr', 'banana', 'portocală']
\`\`\`

### join() - Unire
\`\`\`python
fructe = ["măr", "banana", "portocală"]

text = ", ".join(fructe)
print(text)  # Output: măr, banana, portocală
\`\`\`

### strip() - Eliminare Spații
\`\`\`python
text = "  Bună  "

print(text.strip())  # Output: Bună
\`\`\`

## Exemple Practice

### Exemplu 1: Calcularea Mediei

\`\`\`python
note = [8, 9, 7, 10]

media = sum(note) / len(note)
print(f"Media: {media}")  # Output: 8.5
\`\`\`

### Exemplu 2: Căutarea Numărului Cel Mai Mare

\`\`\`python
numere = [3, 7, 2, 9, 1]

maxim = max(numere)
minim = min(numere)

print(f"Max: {maxim}, Min: {minim}")  # Output: Max: 9, Min: 1
\`\`\`

### Exemplu 3: Procesare Text

\`\`\`python
text = "python este awesome"

# Conversie majuscule + eliminare spații
text_curat = text.upper().strip()
print(text_curat)  # Output: PYTHON ESTE AWESOME

# Numărare caractere
nr_caractere = len(text)
print(nr_caractere)  # Output: 19
\`\`\`

## Erori Comune

### Eroare 1: Index Out of Range

\`\`\`python
numere = [1, 2, 3]

print(numere[5])  # ✗ EROARE - nu există index 5!
\`\`\`

### Eroare 2: Schimbarea Lungimii Mientras Iterezi

\`\`\`python
fructe = ["măr", "banana", "portocală"]

for fruct in fructe:
    if fruct == "banana":
        fructe.remove(fruct)  # ✗ RISCANT - modifică lista
\`\`\`

## Rezumat

- **Liste**: Colecții de mai multe valori
- **Index**: Poziția elementului (cu 0 la început)
- **Metode**: append(), remove(), sort(), append() jemand
- **Stringuri**: Text, care se comportă ca o listă de caractere
- **Slicing**: Extrage parti dintr-un string: text[start:end]

## Următorii Pași

Acum că poți lucra cu colecții! Dar dacă vrei să iei cod și să-l reutilizezi? Aia sunt **funcții** - lecția următoare!`,
      moduleId: pythonModule.id,
      order: 5
    }
  });

  const lesson6 = await prisma.lesson.create({
    data: {
      title: 'Funcții',
      description: 'Scrie cod reutilizabil cu funcții.',
      content: `# Funcții: Cod Reutilizabil

## De Ce Avem Nevoie de Funcții?

Imaginează-ți programul tău crește. Ai nevoie de codul care calculează media a 3 numere în 10 locuri diferite. Copies-paste? NU!

Asta fac **funcțiile** - permite unei bucăți de cod să fie scrisă O DATĂ și utilizată DE MULTIPLE ORI.

## Ce Este o Funcție?

O **funcție** e un "cuvânt magic" care execută o sarcină specifică. Apui de ea și face ce i-ai spus.

## Definiția unei Funcții

Folosești cuvântul \`def\`:

\`\`\`python
def saluta():
    print("Bună!")

saluta()  # Output: Bună!
\`\`\`

**Observă:**
1. \`def\` spune: "Eu defin o funcție"
2. \`saluta\` e NUMELE funcției
3. \`()\` - paranteze (vorbim despre parametri mai jos)
4. \`:\` - colon la final
5. Codul din funcție e **INDENTAT**
6. \`saluta()\` - APELUL funcției

## Funcții cu Parametri

Parametrii sunt variabile pe care le trimit funcției:

\`\`\`python
def saluta(nume):
    print(f"Bună, {nume}!")

saluta("Ion")     # Output: Bună, Ion!
saluta("Maria")   # Output: Bună, Maria!
saluta("Ana")     # Output: Bună, Ana!
\`\`\`

**Observație:** Acum funcția e mai versatilă! Poate saluta ORICINE.

### Multipli Parametri:

\`\`\`python
def aduna(a, b):
    print(f"{a} + {b} = {a + b}")

aduna(5, 3)      # Output: 5 + 3 = 8
aduna(10, 20)    # Output: 10 + 20 = 30
\`\`\`

## Return - Returnarea Valorilor

Funcțiile pot NU DOAR să afișeze, ci și să **returneze** valori pentru a fi folosite în altă parte:

\`\`\`python
def aduna(a, b):
    return a + b

rezultat = aduna(5, 3)
print(rezultat)  # Output: 8
\`\`\`

**Diferență Important:**
- Cu \`print()\` - afișează pe ecran
- Cu \`return\` - trimite valoarea înapoi, poți s-o folosești

### Exemplu:

\`\`\`python
def calculate_media(nota1, nota2, nota3):
    media = (nota1 + nota2 + nota3) / 3
    return media

rezultat = calculate_media(8, 9, 7)
print(f"Media: {rezultat}")  # Output: Media: 8.0
\`\`\`

## Parametri Impliciti (Default Parameters)

Poți da valori implicite dacă nu se transmit parametri:

\`\`\`python
def saluta(nume="Prieten"):
    print(f"Bună, {nume}!")

saluta()        # Output: Bună, Prieten!
saluta("Ion")   # Output: Bună, Ion!
\`\`\`

### Alt Exemplu cu Valori Implicite:

\`\`\`python
def impartire(a, b=1):
    return a / b

print(impartire(10))      # Output: 10.0 (10 / 1)
print(impartire(10, 2))   # Output: 5.0 (10 / 2)
\`\`\`

## Variabile Locale vs Globale

### Variabile Locale

Sunt doar în interiorul funcției:

\`\`\`python
def myfunc():
    x = 5  # Local - doar în funcție
    print(x)

myfunc()       # Output: 5
print(x)       # ✗ EROARE - x nu există în afara funcției
\`\`\`

### Variabile Globale

Există în toată програма:

\`\`\`python
x = 10  # Global

def myfunc():
    print(x)  # Usa x din exterior

myfunc()       # Output: 10
print(x)       # Output: 10
\`\`\`

## Exemple Practice

### Exemplu 1: Calculul Ariei

\`\`\`python
def arie_dreptunghi(lungime, latime):
    return lungime * latime

def arie_cerc(raza):
    return 3.14 * raza ** 2

print(arie_dreptunghi(5, 3))   # Output: 15
print(arie_cerc(2))             # Output: 12.56
\`\`\`

### Exemplu 2: Validare Nume

\`\`\`python
def este_valid(nume):
    if len(nume) >= 3:
        return True
    else:
        return False

nume = input("Introduce nume: ")

if este_valid(nume):
    print(f"Bine, {nume}!")
else:
    print("Numele trebuie să aibă cel puțin 3 litere")
\`\`\`

### Exemplu 3: Suma Elementelor dintr-o Listă

\`\`\`python
def suma_numere(numere):
    total = 0
    for num in numere:
        total = total + num
    return total

print(suma_numere([1, 2, 3, 4, 5]))   # Output: 15
print(suma_numere([10, 20, 30]))      # Output: 60
\`\`\`

### Exemplu 4: Verificare NUM PRIM

\`\`\`python
def este_prim(numar):
    if numar < 2:
        return False
    
    for i in range(2, numar):
        if numar % i == 0:
            return False
    
    return True

print(este_prim(17))  # Output: True
print(este_prim(8))   # Output: False
print(este_prim(2))   # Output: True
\`\`\`

## Docstrings - Documentație

Explicai ce face funcția:

\`\`\`python
def aduna(a, b):
    """
    Adună două numere și returnează rezultatul.
    
    Parametri:
    a (int/float): Primul număr
    b (int/float): Al doilea număr
    
    Return:
    int/float: Suma
    """
    return a + b

print(aduna(5, 3))  # Output: 8
\`\`\`

## Bune Practici

### 1. Nume Semnificative

\`\`\`python
# RĂU:
def f(x):
    return x * 2

# BUN:
def dubla_numarul(numar):
    return numar * 2
\`\`\`

### 2. O Responsabilitate per Funcție

\`\`\`python
# RĂU - Funcția face prea mult:
def inregistrare_utilizator(nume, varsta, email, telefon):
    validare(nume, varsta, email, telefon)
    salveaza_baza_date(nume, varsta, email, telefon)
    trimite_email(email)
    # ... 20 de linii pentru 20 de lucruri

# BUN - Funcții mici, dedicate:
def validare(date):
    # ...doar validare

def salveaza_baza_date(date):
    # ...doar salvare

def trimite_email(email):
    # ...doar trimitere email
\`\`\`

### 3. Evita Efecte Secundare Neașteptate

\`\`\`python
# RĂU:
lista_globala = []

def adauga(element):
    lista_globala.append(element)  # Modifică global!

# BUN:
def adauga_la_lista(lista, element):
    lista.append(element)
    return lista
\`\`\`

## Erori Comune

### Eroare 1: Uita return

\`\`\`python
def aduna(a, b):
    a + b  # ✗ EROARE - nu return-ezi!

rezultat = aduna(5, 3)
print(rezultat)  # Output: None
\`\`\`

**Corect:**
\`\`\`python
def aduna(a, b):
    return a + b  # ✓ Return
\`\`\`

### Eroare 2: Indentare Greșită

\`\`\`python
def saluta():
print("Bună!")  # ✗ EROARE - trebuie indentat!
\`\`\`

**Corect:**
\`\`\`python
def saluta():
    print("Bună!")  # ✓ Indentat
\`\`\`

### Eroare 3: Apela Funcție Înainte de a o Defini

\`\`\`python
saluta()  # ✗ EROARE - nu-i definită încă!

def saluta():
    print("Bună!")
\`\`\`

**Corect:**
\`\`\`python
def saluta():
    print("Bună!")

saluta()  # ✓ Definim-o; apoi o apelezi
\`\`\`

## Rezumat

- **def**: Definiți o funcție
- **return**: Returnează valoare din funcție
- **Parametri**: Variabile transmise funcției
- **Valori Implicite**: Parametri cu valori default
- **Docstrings**: Documentație pentru funcții
- **Practici Bune**: Nume semnificative, o responsabilitate per funcție

## Ai Finalizat Python!

Felicitări! Ai acum competențele de bază în Python:
1. ✅ Print și Variabile
2. ✅ Operații Aritmetice
3. ✅ Condiții (if/elif/else)
4. ✅ Bucle (for/while)
5. ✅ Liste și Stringuri
6. ✅ Funcții

Ești gata pentru mai mult! Explore bibliote populare Python, crează proiecte mai mari, și continua să înveți!`,
      moduleId: pythonModule.id,
      order: 6
    }
  });

  // 4. Creăm Problemele asociate pentru Python
  console.log('🧩 Creare Probleme Python...');

  const p1 = await prisma.problem.create({
    data: {
      title: 'Hello World',
      description: 'Afișează "Hello World" pe ecran folosind print().',
      difficulty: 'Easy',
      lessonId: lesson1.id,
      testCases: [
        { input: "", output: "Hello World" }
      ],
    },
  });

  const p2 = await prisma.problem.create({
    data: {
      title: 'Suma a Două Numere',
      description: 'Citește două numere și afișează suma lor. Intrare: două numere pe linii diferite. Ieșire: suma.",',
      difficulty: 'Easy',
      lessonId: lesson2.id,
      testCases: [
        { input: "5\n7", output: "12" },
        { input: "10\n20", output: "30" },
        { input: "-5\n8", output: "3" }
      ],
    },
  });

  const p3 = await prisma.problem.create({
    data: {
      title: 'Număr Par sau Impar',
      description: 'Citesc un număr și afișează dacă este par sau impar.',
      difficulty: 'Easy',
      lessonId: lesson3.id,
      testCases: [
        { input: "4", output: "par" },
        { input: "7", output: "impar" },
        { input: "0", output: "par" }
      ],
    },
  });

  const p4 = await prisma.problem.create({
    data: {
      title: 'Factorialul Unui Număr',
      description: 'Calculează factorialul unui număr n (n!). Factorial înseamnă n * (n-1) * (n-2) * ... * 1.',
      difficulty: 'Medium',
      lessonId: lesson4.id,
      testCases: [
        { input: "5", output: "120" },
        { input: "3", output: "6" },
        { input: "1", output: "1" }
      ],
    },
  });

  const p5 = await prisma.problem.create({
    data: {
      title: 'Inversarea unei Liste',
      description: 'Citără o listă de numere și afișează-o în ordine inversă.',
      difficulty: 'Easy',
      lessonId: lesson5.id,
      testCases: [
        { input: "5\n1 2 3 4 5", output: "5 4 3 2 1" },
        { input: "3\n10 20 30", output: "30 20 10" }
      ],
    },
  });

  const p6 = await prisma.problem.create({
    data: {
      title: 'Maxim dintr-o Listă',
      description: 'Găsește și afișează elementul maxim dintr-o listă.',
      difficulty: 'Medium',
      lessonId: lesson6.id,
      testCases: [
        { input: "5\n3 7 2 9 1", output: "9" },
        { input: "4\n10 5 15 8", output: "15" }
      ],
    },
  });

  // C++ Lessons
  console.log('📚 Creare Lecții C++...');

  const cppLesson1 = await prisma.lesson.create({
    data: {
      title: 'Introducere în C++',
      description: 'Structura unui program și Hello World.',
      content: `# Introducere în C++

## Structura unui program C++
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}
\`\`\`

## Explicație
- \`#include <iostream>\` - includ biblioteca pentru input/output
- \`using namespace std;\` - folosesc namespace-ul standard
- \`main()\` - funcția principală care se execută prima
- \`cout\` - afișează text pe ecran
- \`endl\` - sfârșit de linie
- \`return 0;\` - programul s-a executat cu succes`,
      moduleId: cppModule.id,
      order: 1
    }
  });

  const cppProblem1 = await prisma.problem.create({
    data: {
      title: 'Hello World în C++',
      description: 'Afișează "Hello World" pe ecran.',
      difficulty: 'Easy',
      lessonId: cppLesson1.id,
      testCases: [
        { input: "", output: "Hello World" }
      ],
    },
  });

  console.log('🎉 Seed finalizat cu succes!');
  console.log(`✅ ${6} lecții Python create`);
  console.log(`✅ ${6} probleme Python create`);
  console.log(`✅ ${1} lecție C++ creată`);
  console.log(`✅ ${1} problemă C++ creată`);
}

main()
  .catch((e) => {
    console.error('❌ Eroare la seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });