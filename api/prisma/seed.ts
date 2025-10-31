import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create the initial Huye District Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const countryAdmin = await prisma.register.upsert({
    where: { email: 'admin@vetguard.rw' },
    update: {},
    create: {
      firstName: 'Huye',
      lastName: 'District Admin',
      email: 'admin@vetguard.rw',
      phone: '+250788000000',
      nationalId: '0000000000000000',
      dateOfBirth: new Date('1980-01-01'),
      gender: 'male',
      password: hashedPassword,
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      graduationYear: 2000,
      workplace: 'Huye District Veterinary Office',
      role: 'ADMIN',
      isFirstLogin: true,
      status: 'APPROVED',
    },
  });

  console.log('✅Huye District Admin created:', {
    id: countryAdmin.id,
    email: countryAdmin.email,
    name: `${countryAdmin.firstName} ${countryAdmin.lastName}`,
    role: countryAdmin.role,
  });
  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Initial Credentials:');
  console.log('Huye District Admin: admin@vetguard.rw / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
