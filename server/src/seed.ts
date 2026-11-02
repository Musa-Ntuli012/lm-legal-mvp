import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding LM Legal MVP database...');

  // Create admin user
  const adminHash = await argon2.hash('AdminDemo2026!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const admin = await prisma.profile.upsert({
    where: { email: 'admin@lmlegal.demo' },
    update: {},
    create: {
      email: 'admin@lmlegal.demo',
      passwordHash: adminHash,
      displayName: 'Demo Administrator',
      role: 'ADMINISTRATOR',
      membershipStatus: 'ACTIVE',
    },
  });

  // Create marker user
  const markerPassword = cryptoRandomPassword();
  const markerHash = await argon2.hash(markerPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const _marker = await prisma.profile.upsert({
    where: { email: 'investor@lmlegal.demo' },
    update: {},
    create: {
      email: 'investor@lmlegal.demo',
      passwordHash: markerHash,
      displayName: 'Demo Investor Marker',
      role: 'MARKER',
      membershipStatus: 'ACTIVE',
    },
  });

  // Create student user
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

  // Create inactive member
  const inactiveHash = await argon2.hash('InactiveDemo2026!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await prisma.profile.upsert({
    where: { email: 'inactive@lmlegal.demo' },
    update: {},
    create: {
      email: 'inactive@lmlegal.demo',
      passwordHash: inactiveHash,
      displayName: 'Inactive Member',
      role: 'STUDENT',
      membershipStatus: 'INACTIVE',
    },
  });

  // Create sample task
  const task = await prisma.task.create({
    data: {
      title: 'Unfair Dismissal CCMA Referral',
      practiceArea: 'Labour Law',
      description: 'A weekly legal simulation task for students to assess an unfair dismissal case.',
      status: 'PUBLISHED',
      releaseAt: new Date(),
      deadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      lateAcceptance: false,
      resubmissionAllowed: false,
      creatorId: admin.id,
          versions: {
            create: {
              version: 1,
              blocks: JSON.stringify([
                { type: 'SCENARIO', title: 'Client brief', order: 1 },
                { type: 'EMAIL', title: 'Client email', order: 2 },
                { type: 'DOCUMENT', title: 'Dismissal letter', order: 3 },
                { type: 'DOCUMENT', title: 'Disciplinary hearing', order: 4 },
                { type: 'DOCUMENT', title: 'Stock count sheet', order: 5 },
                { type: 'DOCUMENT', title: 'Client intake note', order: 6 },
                { type: 'QUESTION', title: 'Dismissal type', order: 7 },
                { type: 'QUESTION', title: 'Forum', order: 8 },
                { type: 'QUESTION', title: 'Time limit', order: 9 },
                { type: 'DECISION', title: 'Decision point', order: 10 },
                { type: 'DRAFTING', title: 'Memo draft', order: 11 },
                { type: 'SUBMISSION', title: 'Submit', order: 12 },
              ]),
              isCurrent: true,
              createdBy: admin.id,
            },
          },
      rubric: {
        create: {
          criteria: JSON.stringify([
            { id: 'c1', name: 'Legal analysis', weight: 4, levelDescriptions: {} },
            { id: 'c2', name: 'Procedural fairness', weight: 3, levelDescriptions: {} },
            { id: 'c3', name: 'CCMA rules', weight: 3, levelDescriptions: {} },
            { id: 'c4', name: 'Remedies', weight: 3, levelDescriptions: {} },
            { id: 'c5', name: 'Communication', weight: 2, levelDescriptions: {} },
          ]),
          maxScore: 15,
        },
      },
      modelAnswer: {
        create: {
          content: 'Model answer for the unfair dismissal case.',
          explanation: 'The dismissal was procedurally unfair.',
          releaseRule: 'AFTER_SUBMISSION',
        },
      },
    },
    include: {
      versions: true,
      rubric: true,
      modelAnswer: true,
    },
  });

  console.log('Seeding complete!');
  console.log('');
  console.log('Seeded accounts:');
  console.log(`  Admin:           admin@lmlegal.demo / AdminDemo2026!`);
  console.log(`  Student:         student@lmlegal.demo / StudentDemo2026!`);
  console.log(`  Inactive:        inactive@lmlegal.demo / InactiveDemo2026!`);
  console.log(`  Marker:          investor@lmlegal.demo / ${markerPassword} (expires in 7 days)`);
  console.log('');
  console.log(`Sample task created: ${task.id}`);
}

function cryptoRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += 'Aa1!';
  return result;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
