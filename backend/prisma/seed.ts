import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database to match Figma Outbox Labs assignment...');

  // 1. Upsert Oliver Brown user matching Figma
  const oliver = await prisma.user.upsert({
    where: { email: 'oliver.brown@domain.io' },
    update: {
      name: 'Oliver Brown',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    },
    create: {
      googleId: 'figma-oliver-brown',
      email: 'oliver.brown@domain.io',
      name: 'Oliver Brown',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    },
  });

  // Also update evaluator user if it exists so both demo logins show Oliver Brown
  await prisma.user.updateMany({
    where: { email: 'evaluator@reachinbox.test' },
    data: {
      name: 'Oliver Brown',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    },
  });

  const evaluator = await prisma.user.findFirst({
    where: { email: 'evaluator@reachinbox.test' },
  });

  const userIds = [oliver.id, ...(evaluator ? [evaluator.id] : [])];

  for (const uid of userIds) {
    // 2. Scheduled Emails matching Figma Image 2 & 3
    await prisma.emailJob.createMany({
      data: [
        {
          userId: uid,
          senderEmail: 'oliver.brown@domain.io',
          recipientEmail: 'john.smith@domain.io',
          subject: 'Meeting follow-up - Scheduled',
          body: 'Hi John, just wanted to follow up on our meeting yesterday regarding the cold email outreach workflows.',
          scheduledAt: new Date(Date.now() + 86400000 * 2), // Tue 9:15 AM
          status: 'SCHEDULED',
        },
        {
          userId: uid,
          senderEmail: 'oliver.brown@domain.io',
          recipientEmail: 'olive@domain.io',
          subject: "Ramit, great to meet you - you'll love it",
          body: "Hi Olive, just wanted to follow up on our meeting and see if you had any questions on scaling.",
          scheduledAt: new Date(Date.now() + 86400000 * 4), // Thu 8:15 PM
          status: 'SCHEDULED',
        },
        {
          userId: uid,
          senderEmail: 'oliver.brown@domain.io',
          recipientEmail: 'diana.prince@themyscira.gov',
          subject: 'Outbox Labs Partnership Proposal',
          body: 'Hi Diana, here is the proposal for integrating our AI-driven scheduler.',
          scheduledAt: new Date(Date.now() + 86400000 * 5),
          status: 'SCHEDULED',
        },
      ],
      skipDuplicates: true,
    });

    // 3. Sent Emails matching Figma Image 3
    await prisma.emailJob.createMany({
      data: [
        {
          userId: uid,
          senderEmail: 'oliver.brown@domain.io',
          recipientEmail: 'sarah.wilson@domain.io',
          subject: 'Re: Project Update',
          body: 'Thanks for the update, Sarah. Looks good!',
          scheduledAt: new Date(Date.now() - 3600000 * 4),
          sentAt: new Date(Date.now() - 3600000 * 4),
          status: 'SENT',
          etherealPreviewUrl: 'https://ethereal.email/message/asfTr0YSGgV8.pvXasfTuFz99noLdbZxAAAAAiywdc2rs6l-Aibr3WvXs64',
        },
        {
          userId: uid,
          senderEmail: 'oliver.brown@domain.io',
          recipientEmail: 'support@reachinbox.test',
          subject: 'Issue with login',
          body: 'I am having trouble logging in to the dashboard from a different browser.',
          scheduledAt: new Date(Date.now() - 3600000 * 12),
          sentAt: new Date(Date.now() - 3600000 * 12),
          status: 'SENT',
          etherealPreviewUrl: 'https://ethereal.email/message/asfTr0YSGgV8.pvXasfTtsAYPlgYicy7AAAAAQwhc1TpkR3kl-X3xR8Jkp4',
        },
        {
          userId: uid,
          senderEmail: 'sender@example.com',
          recipientEmail: 'oliver.brown@domain.io',
          subject: 'Oliver, hello there! | MJWYT44 BM#52W01',
          body: `Hey Oliver,\n\nYou've just RECEIVED something\n\n⚡ Extremely Exclusive—Only 4 Spots Worldwide Per Year | $25,000 investment ⚡\nTo explore securing your private transformation, simply reply right now with "FLY OUT FIX" .\n\nYour coach for world-class performance,\nGrant\n\nP.S. Always remember that you can develop world class technique! 🚀`,
          scheduledAt: new Date(Date.now() - 3600000 * 48),
          sentAt: new Date(Date.now() - 3600000 * 48),
          status: 'SENT',
          etherealPreviewUrl: 'https://ethereal.email/message/asfTr0YSGgV8.pvXasfTuFz99noLdbZxAAAAAiywdc2rs6l-Aibr3WvXs64',
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
