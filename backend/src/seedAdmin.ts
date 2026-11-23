import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const p = new PrismaClient();

const pages: Record<string, { title: string; body: string[] }> = {
  governance: {
    title: 'Governance and Council',
    body: [
      'The International Association of Engineering Professionals (IAEP) is a professional membership body for engineers. It is governed by its Council and administered day to day by its Secretariat at Ughevwughe, Ughelli South, Delta State, Nigeria.',
      'THE COUNCIL\nThe Council is the governing body of the Association. It sets policy, approves the Code of Professional Conduct, approves the annual financial statement, and appoints the Admissions Board. The Council is drawn from the Fellows of the Association (FIAEP).',
      'THE ADMISSIONS BOARD\nThe Admissions Board reviews every application for membership against the published requirements for each grade. It may approve an application, decline it with reasons, or ask the applicant for further evidence. Decisions are recorded in the membership register.',
      'THE SECRETARIAT\nThe Secretariat runs the Association: it maintains the membership register, issues membership numbers and credentials, organises events and CPD programmes, answers enquiries and keeps the records of the Council.',
      'MEMBERSHIP GRADES\nStudent Member (SIAEP), Graduate Member (GIAEP), Associate Member (AIAEP), Professional Member (MIAEP) and Fellow (FIAEP). Each grade has its own entry requirements, shown on the membership application page.',
      'ACCOUNTABILITY\nEvery member, officer and Council member is bound by the Code of Professional Conduct. Concerns about the conduct of a member or the running of the Association may be sent to the Secretariat through the Contact page and will be placed before the Council.',
    ],
  },
  constitution: {
    title: 'Constitution, Policies and Ethics',
    body: [
      'OBJECTS\nThe Association exists to advance the engineering profession and the public good: to admit and recognise engineers by grade according to their training and practice, to promote continuing professional development, to uphold ethical conduct, and to provide a forum for engineers across disciplines and countries.',
      'MEMBERSHIP\nMembership is open to engineers and engineering students worldwide in five grades: Student, Graduate, Associate, Professional and Fellow. Professional Membership (MIAEP) requires an engineering degree and verified professional practice, with a minimum of five years of experience. Each member is admitted into one primary discipline: Civil and Structural; Mechanical and Marine; Electrical and Electronics; Chemical and Process; Petroleum and Gas; Software and Computer; or Environmental and Safety.',
      'STATUTORY LICENSING\nIAEP membership does not replace statutory licensing. In Nigeria, engineers who practise must hold the registration required by COREN, and members in other countries must comply with the licensing law of the country where they work. Members may not use IAEP membership to suggest they hold a statutory licence they do not have.',
      'CODE OF PROFESSIONAL CONDUCT\n1. Public safety and welfare come first. A member must not put a client, an employer or personal gain above the safety of people.\n2. Competence. A member works only within the limits of their training and experience, and says so when a task is beyond them.\n3. Honesty. A member gives truthful statements, claims only the qualifications and grade they hold, and reports results faithfully.\n4. Integrity. A member declares conflicts of interest, refuses bribes and improper inducements, and does not falsify records.\n5. Confidentiality. A member respects the confidential information of clients and employers unless public safety or the law requires disclosure.\n6. Environment. A member considers the environmental effect of their work and works toward sustainable practice.\n7. Development. A member keeps their knowledge current. Professional Members are expected to complete 40 hours of continuing professional development each year.\n8. Fairness. A member treats colleagues with respect and does not discriminate.',
      'COMPLAINTS AND DISCIPLINE\nA complaint about a member is made in writing to the Secretariat. The member is told of the complaint and given a fair opportunity to respond. The Council decides the outcome, which may be no action, a warning, suspension, or removal from the register. A member removed from the register must stop using the IAEP grade and post-nominal letters.',
      'AMENDMENT\nThis constitution and the Code of Conduct may be amended only by decision of the Council.',
    ],
  },
  treasury: {
    title: 'Council Treasury and Finances',
    body: [
      'The Association is funded by membership fees and by the events and learning programmes it organises. Its funds are applied only to the purposes of the Association: operating the Secretariat, running events and CPD programmes, and serving members.',
      'FINANCIAL YEAR AND REPORTING\nThe Secretariat keeps the accounts of the Association. After the end of each financial year the Council reviews and approves the annual financial statement, and the Secretariat publishes it on this page for members to read.',
      'MEMBERSHIP FEES\nThe fee for each grade is set by the Council and published before an applicant is asked to pay. No member is charged a fee that has not been published. The Association does not currently take payment through this website. Payment arrangements will be announced to members by the Secretariat before they take effect.',
      'SAFEGUARDS\nAssociation money is held in the name of the Association and not in the personal accounts of any officer. Spending is authorised by the Council, and no Council member may approve a payment to themselves or to a business in which they hold an interest.',
      'QUESTIONS\nMembers who wish to ask about the accounts may write to the Secretariat through the Contact page. Questions are answered by the Secretariat or referred to the Council.',
    ],
  },
  chapters: {
    title: 'Chapters and Countries',
    body: [
      'IAEP is a worldwide association. Its Secretariat is at Ughevwughe, Ughelli South, Delta State, Nigeria, and its members work in engineering in any country. Each member records their country of practice when they apply.',
      'WHAT A CHAPTER IS\nA chapter is a local group of IAEP members in one country or region. Chapters meet members in person, host technical talks and local CPD events, welcome new engineers and students, and report to the Secretariat.',
      'STARTING A CHAPTER\nMembers in a country or region who would like to form a chapter write to the Secretariat through the Contact page, giving their names, membership numbers, grades and location. The Council considers the request and, once it is approved, the Secretariat supports the chapter with the register of members in that area and a place on the events calendar.',
      'MEMBERS WITHOUT A CHAPTER\nMembers in places with no chapter are full members. They take part online through the member portal, the events calendar and the learning programmes.',
      'LOCAL LAW\nChapters and their members must follow the laws of their country, including the statutory licensing requirements for engineers.',
    ],
  },
  corporate: {
    title: 'Corporate Partnerships',
    body: [
      'IAEP works with engineering firms, contractors, operators, training providers, universities and public bodies that want to raise professional standards in their workforce.',
      'WAYS TO WORK WITH IAEP\n1. Staff development: enrol engineers in IAEP CPD courses, and recognise IAEP membership and CPD records in your own career structure.\n2. Events: host or sponsor technical symposia, webinars and congresses.\n3. Graduate and student pathways: support Student and Graduate Members through placements, mentoring and sponsorship.\n4. Technical input: offer practitioners to speak, review course material or contribute to a discipline.',
      'STANDARDS FOR PARTNERS\nPartnership does not give any organisation a say in admissions or in the grading of any member, and it does not imply endorsement of a partner by the Association. Partners are expected to respect the Code of Professional Conduct in everything done jointly with IAEP.',
      'HOW TO BEGIN\nWrite to the Secretariat through the Contact page, naming your organisation, what you would like to do together and a contact person. The Secretariat will reply and, where appropriate, refer the proposal to the Council.',
    ],
  },
};

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const pw = process.env.ADMIN_PASSWORD || '';
  if (email && pw.length >= 8) {
    const passwordHash = await bcrypt.hash(pw, 10);
    await p.user.upsert({
      where: { email },
      update: { passwordHash, role: 'ADMIN' },
      create: { email, passwordHash, name: 'IAEP Administrator', role: 'ADMIN' },
    });
    console.log('admin account ready');
  }
  for (const [slug, v] of Object.entries(pages)) {
    await p.page.upsert({ where: { slug }, update: {}, create: { slug, title: v.title, body: v.body.join('\n\n') } });
  }
  const existing = await p.page.findMany({ where: { slug: { in: Object.keys(pages) }, body: '' } });
  for (const e of existing) await p.page.update({ where: { slug: e.slug }, data: { body: pages[e.slug].body.join('\n\n') } });
  console.log('pages ready');
}
main().catch((e) => { console.error(e); }).finally(() => p.$disconnect());
