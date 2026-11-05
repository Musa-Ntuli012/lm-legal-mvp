import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Generates a random password string using crypto.randomBytes.
 * Used for demo marker/admin accounts where the password is printed on seed.
 */
function cryptoRandomPassword(): string {
  return crypto.randomBytes(16).toString('base64url');
}

async function main() {
  console.log('Seeding database...');

  // Create demo marker user.
  const markerPassword = cryptoRandomPassword();
  const markerHash = await argon2.hash(markerPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const _marker = await prisma.profile.upsert({
    where: { email: 'investor@lmlegal.demo' },
    update: { passwordHash: markerHash },
    create: {
      email: 'investor@lmlegal.demo',
      passwordHash: markerHash,
      displayName: 'Demo Investor Marker',
      role: 'MARKER',
      membershipStatus: 'ACTIVE',
    },
  });

  console.log(`Marker created: investor@lmlegal.demo / ${markerPassword}`);

  // Create demo student user.
  const studentHash = await argon2.hash('StudentDemo2026!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const _student = await prisma.profile.upsert({
    where: { email: 'student@lmlegal.demo' },
    update: {},
    create: {
      email: 'student@lmlegal.demo',
      passwordHash: studentHash,
      displayName: 'Demo Student',
      role: 'STUDENT',
      membershipStatus: 'ACTIVE',
    },
  });

  console.log('Student created: student@lmlegal.demo / StudentDemo2026!');

  // Create demo administrator user.
  const adminPassword = cryptoRandomPassword();
  const adminHash = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const _admin = await prisma.profile.upsert({
    where: { email: 'admin@lmlegal.demo' },
    update: { passwordHash: adminHash },
    create: {
      email: 'admin@lmlegal.demo',
      passwordHash: adminHash,
      displayName: 'Demo Administrator',
      role: 'ADMINISTRATOR',
      membershipStatus: 'ACTIVE',
    },
  });

  console.log(`Administrator created: admin@lmlegal.demo / ${adminPassword}`);

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
