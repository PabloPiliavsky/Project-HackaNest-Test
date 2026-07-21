const { PrismaClient } = require('@prisma/client');

async function run() {
  const prisma = new PrismaClient();
  const rand = Math.floor(Math.random() * 100000);
  const emailParticipant = `participant_${rand}@test.com`;
  const emailAdmin = `admin_${rand}@test.com`;
  const password = 'mypassword123';

  console.log('--- Registering participant user ---');
  let resPart = await fetch('http://localhost:3000/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ name: 'Participant User', email: emailParticipant, password })
  });
  let dataPart = await resPart.json();
  const cookiePart = resPart.headers.get('set-cookie');

  console.log('--- Registering admin user ---');
  let resAdmin = await fetch('http://localhost:3000/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ name: 'Admin User', email: emailAdmin, password })
  });
  let dataAdmin = await resAdmin.json();
  const cookieAdmin = resAdmin.headers.get('set-cookie');
  const adminId = dataAdmin.user.id;

  console.log('--- Upgrading admin user role in DB ---');
  await prisma.user.update({
    where: { id: adminId },
    data: { role: 'admin' }
  });

  console.log('--- Creating Person for admin ---');
  const adminPerson = await prisma.person.upsert({
    where: { userId: adminId },
    update: {},
    create: { name: 'Admin Person', userId: adminId }
  });
  const personId = adminPerson.id;

  console.log('\n--- TEST 1: POST /hackathons (NO TOKEN) ---');
  let res1 = await fetch('http://localhost:3000/hackathons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Hackathon', authorId: personId, start: new Date(), end: new Date() })
  });
  console.log('Status:', res1.status, await res1.text());

  console.log('\n--- TEST 2: POST /hackathons (PARTICIPANT TOKEN) ---');
  let res2 = await fetch('http://localhost:3000/hackathons', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookiePart || ''
    },
    body: JSON.stringify({ name: 'Test Hackathon', authorId: personId, start: new Date(), end: new Date() })
  });
  console.log('Status:', res2.status, await res2.text());

  console.log('\n--- TEST 3: POST /hackathons (ADMIN TOKEN) ---');
  let res3 = await fetch('http://localhost:3000/hackathons', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookieAdmin || ''
    },
    body: JSON.stringify({ name: 'Test Hackathon', authorId: personId, start: new Date(), end: new Date() })
  });
  console.log('Status:', res3.status, await res3.text());
  
  process.exit(0);
}

run().catch(console.error);
