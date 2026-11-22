import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const p = new PrismaClient();
const grades = [
  ['student', 'Student Member', 'SIAEP', 'For engineering students in an accredited programme.', 0, 10],
  ['graduate', 'Graduate Member', 'GIAEP', 'For recent engineering graduates building their practice.', 0, 20],
  ['associate', 'Associate Member', 'AIAEP', 'For technicians and engineers with a diploma and field experience.', 3, 30],
  ['professional', 'Professional Member', 'MIAEP', 'For engineers with a degree and verified professional practice.', 5, 40],
  ['fellow', 'Fellow', 'FIAEP', 'For senior engineers with a distinguished record of leadership.', 15, 40],
];
async function main() {
  for (const [id, name, postNominal, description, minYears, cpdHours] of grades)
    await p.grade.upsert({ where: { id: id as string }, update: {}, create: { id, name, postNominal, description, minYears, cpdHours } as any });
  if ((await p.course.count()) === 0)
    await p.course.createMany({ data: [
      { title: 'Engineering Ethics and Public Safety', level: 'Foundation', cpdHours: 6, description: 'Professional conduct, liability and safety-first decision making.' },
      { title: 'Project Management for Engineers', level: 'Intermediate', cpdHours: 12, description: 'Planning, risk and delivery of engineering projects.' },
      { title: 'Asset Integrity and Maintenance', level: 'Advanced', cpdHours: 10, description: 'Inspection, reliability and lifecycle management of plant.' },
    ] });
  if ((await p.event.count()) === 0)
    await p.event.createMany({ data: [
      { title: 'IAEP World Engineering Congress', category: 'Congress', date: new Date('2027-03-18T09:00:00Z'), venue: 'Ughevwughe Secretariat, Delta State', speaker: 'Council of Fellows', cpdHours: 16 },
      { title: 'Technical Symposium: Energy Infrastructure', category: 'Symposium', date: new Date('2027-01-28T10:00:00Z'), venue: 'Lagos', speaker: 'To be announced', cpdHours: 8 },
      { title: 'Webinar: Writing a Strong Membership Application', category: 'Webinar', date: new Date('2026-12-10T15:00:00Z'), venue: 'Online', speaker: 'Admissions Board', cpdHours: 2 },
    ] });
  const email = process.env.ADMIN_EMAIL?.toLowerCase(), pw = process.env.ADMIN_PASSWORD;
  if (email && pw && !(await p.user.findUnique({ where: { email } })))
    await p.user.create({ data: { email, name: 'IAEP Admin', role: 'ADMIN', passwordHash: await bcrypt.hash(pw, 10) } });
}
main().then(() => p.$disconnect()).catch((e) => { console.error(e); process.exit(1); });
