import { PrismaClient } from '@prisma/client';

// Prisma 7+ și tsx gestionează automat .env dacă e în rădăcina proiectului.
// Putem instanția clientul direct.
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Ștergere date vechi...');
  // Folosim un proces tranzacțional pentru a evita erori de foreign key
  await prisma.$transaction([
    prisma.submission.deleteMany(),
    prisma.problem.deleteMany(),
  ]);

  console.log('🌱 Inserare probleme noi...');

  const problems = [
    {
      title: "Suma a două numere",
      description: "Scrie o funcție care primește două numere separate prin spațiu și returnează suma lor. Exemplu: '2 3' -> '5'.",
      difficulty: "EASY",
      // Important: Dacă în schema.prisma testCases este un JSON sau o relație separată, 
      // verifică dacă structura de mai jos corespunde schemei tale.
      testCases: [
        { input: "2 3", output: "5" },
        { input: "10 20", output: "30" }
      ]
    },
    {
      title: "Verificare Palindrom",
      description: "Verifică dacă un string este palindrom. Exemplu: 'ana' -> 'true'.",
      difficulty: "MEDIUM",
      testCases: [
        { input: "ana", output: "true" },
        { input: "salut", output: "false" }
      ]
    }
  ];

  for (const p of problems) {
    await prisma.problem.create({
      data: {
        title: p.title,
        description: p.description,
        difficulty: p.difficulty as any, // "any" sau tipul din Prisma (ex: Difficulty.EASY)
        testCases: p.testCases // Asigură-te că schema permite salvarea directă (ex: tip JSON)
      }
    });
  }

  console.log('✅ Seed finalizat cu succes!');
}

main()
  .catch((e) => {
    console.error('❌ Eroare la seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });