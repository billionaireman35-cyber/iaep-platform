import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const p = new PrismaClient();
const grades: any[] = [
  { id: 'student', name: 'Student Member', postNominal: 'Stud.IAEP', description: 'For undergraduate and diploma students currently enrolled in an accredited engineering or applied technology curriculum.', minYears: 0, cpdHours: 10, duesUsd: 15, duesNgn: 15000 },
  { id: 'graduate', name: 'Graduate / Associate Member', postNominal: 'Grad.IAEP', description: 'Designed for recent engineering graduates beginning structured professional practice and continuous technical development.', minYears: 0, cpdHours: 20, duesUsd: 45, duesNgn: 45000 },
  { id: 'technician', name: 'Engineering Technician Member', postNominal: 'EngTech.IAEP', description: 'For skilled engineering technicians applying established practical techniques, diagnostics, maintenance and precision technical operations.', minYears: 2, cpdHours: 30, duesUsd: 40, duesNgn: 40000 },
  { id: 'technologist', name: 'Engineering Technologist Member', postNominal: 'EngTechlg.IAEP', description: 'For applied engineering technologists with advanced practical capability in system design implementation, fabrication and supervisory engineering.', minYears: 3, cpdHours: 30, duesUsd: 65, duesNgn: 65000 },
  { id: 'professional', name: 'Professional Member', postNominal: 'MIAEP', description: 'The standard full corporate grade for qualified engineers demonstrating sustained competence, ethical responsibility and technical mastery.', minYears: 4, cpdHours: 40, duesUsd: 95, duesNgn: 95000 },
  { id: 'senior', name: 'Senior Professional Member', postNominal: 'SMIAEP', description: 'For established engineers who have held senior leadership, major infrastructure project management, technical consultancy or research authority.', minYears: 10, cpdHours: 40, duesUsd: 140, duesNgn: 140000 },
  { id: 'fellow', name: 'Fellow', postNominal: 'FIAEP', description: 'The highest earned professional distinction of the Association, bestowed upon individuals of outstanding national and international eminence in engineering.', minYears: 15, cpdHours: 40, duesUsd: 220, duesNgn: 220000 },
];
async function main() {
  for (const g of grades) {
    const ex: any = await p.grade.findUnique({ where: { id: g.id } });
    if (!ex) await p.grade.create({ data: g });
    else if (!ex.duesUsd) await p.grade.update({ where: { id: g.id }, data: g });
  }
  try { await p.grade.delete({ where: { id: 'associate' } }); } catch (e) { /* still referenced, keep */ }
  try {
    if (!(await p.page.findUnique({ where: { slug: '_demo_cleaned' } }))) {
      const ev = await p.event.findMany({ where: { title: { in: ['IAEP World Engineering Congress', 'Technical Symposium: Energy Infrastructure', 'Webinar: Writing a Strong Membership Application'] } }, select: { id: true } });
      const evIds = ev.map((e) => e.id);
      if (evIds.length) { await p.registration.deleteMany({ where: { eventId: { in: evIds } } }); await p.event.deleteMany({ where: { id: { in: evIds } } }); }
      const co = await p.course.findMany({ where: { title: { in: ['Engineering Ethics and Public Safety', 'Project Management for Engineers', 'Asset Integrity and Maintenance'] } }, select: { id: true } });
      const coIds = co.map((c) => c.id);
      if (coIds.length) { await p.enrollment.deleteMany({ where: { courseId: { in: coIds } } }); await p.course.deleteMany({ where: { id: { in: coIds } } }); }
      await p.page.create({ data: { slug: '_demo_cleaned', title: 'internal', body: 'done' } });
    }
  } catch (e) { console.error('cleanup skipped', e); }
  const email = process.env.ADMIN_EMAIL?.toLowerCase(), pw = process.env.ADMIN_PASSWORD;
  if (email && pw && !(await p.user.findUnique({ where: { email } })))
    await p.user.create({ data: { email, name: 'IAEP Admin', role: 'ADMIN', passwordHash: await bcrypt.hash(pw, 10) } });
}
main().then(() => p.$disconnect()).catch((e) => { console.error(e); process.exit(1); });
