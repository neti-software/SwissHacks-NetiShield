import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultVendors = [
    {
      name: 'Chainalsys',
      description: 'Chain analysis solution for blockchain security',
      active: true,
    },
    {
      name: 'Blowfish',
      description: 'Real-time transaction monitoring and protection',
      active: true,
    },
    {
      name: 'Elliptic',
      description: 'Blockchain analytics and risk management platform',
      active: true,
    },
  ];

  console.log('🌱 Starting database seed...');

  // Add each vendor, skip if vendor with same name already exists
  for (const vendor of defaultVendors) {
    const exists = await prisma.vendor.findUnique({
      where: { name: vendor.name },
    });

    if (!exists) {
      await prisma.vendor.create({ data: vendor });
      console.log(`Created vendor: ${vendor.name}`);
    } else {
      console.log(`Vendor ${vendor.name} already exists, skipping`);
    }
  }

  console.log('✅ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
