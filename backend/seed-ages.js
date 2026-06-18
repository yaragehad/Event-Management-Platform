const prisma = require('./src/lib/prismaClient.js');

async function main() {
  console.log('Fetching staff members...');
  const staff = await prisma.user.findMany({
    where: { role: 'STAFF' }
  });

  console.log(`Found ${staff.length} staff members. Updating ages...`);

  for (const s of staff) {
    if (!s.age) {
      const randomAge = Math.floor(Math.random() * (45 - 22 + 1)) + 22; // Random age between 22 and 45
      await prisma.user.update({
        where: { id: s.id },
        data: { age: randomAge }
      });
      console.log(`Updated ${s.name} to age ${randomAge}`);
    } else {
      console.log(`${s.name} already has age ${s.age}`);
    }
  }
  console.log('Finished updating ages.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
