import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration: Add veterinarian associations...');

  // First, let's check if we have any existing data
  const patientCount = await prisma.patient.count();
  const treatmentCount = await prisma.treatment.count();
  const adminUser = await prisma.register.findFirst({
    where: { role: 'ADMIN' },
  });

  console.log(
    `Found ${patientCount} patients and ${treatmentCount} treatments`,
  );

  if (patientCount > 0 || treatmentCount > 0) {
    if (!adminUser) {
      throw new Error(
        'No admin user found. Please create an admin user first.',
      );
    }

    console.log(
      `Using admin user ${adminUser.email} (ID: ${adminUser.id}) for existing records`,
    );

    // Update existing patients to be associated with admin user
    if (patientCount > 0) {
      await prisma.patient.updateMany({
        data: { veterinarianId: adminUser.id },
      });
      console.log(
        `Updated ${patientCount} patients to be associated with admin user`,
      );
    }

    // Update existing treatments to be associated with admin user
    if (treatmentCount > 0) {
      await prisma.treatment.updateMany({
        data: { veterinarianId: adminUser.id },
      });
      console.log(
        `Updated ${treatmentCount} treatments to be associated with admin user`,
      );
    }
  }

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
