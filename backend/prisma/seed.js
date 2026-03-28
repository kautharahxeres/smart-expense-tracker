const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@expense.com' },
    update: {},
    create: {
      email: 'demo@expense.com',
      password: '$2a$10$E1Fq8pBc8Cnrn5eM1soEeuB5GIHQRKj6yh1Y.AdZH8QaFm9oYMn1e', // hashed 'password'
      name: 'Demo User',
    },
  });

  const category = await prisma.category.upsert({
    where: { name: 'Food' },
    update: {},
    create: { name: 'Food', description: 'Food and groceries' },
  });

  await prisma.expense.createMany({
    data: [
      {
        amount: 25.5,
        description: 'Lunch at cafe',
        date: new Date(),
        categoryId: category.id,
        userId: user.id,
      },
      {
        amount: 100.0,
        description: 'Monthly supermarket',
        date: new Date(),
        categoryId: category.id,
        userId: user.id,
      },
    ],
  });

  console.log('Seed data inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });