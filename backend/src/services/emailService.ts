import nodemailer, { Transporter } from 'nodemailer';

let transporterPromise: Promise<Transporter> | null = null;

export async function getEmailTransporter(): Promise<Transporter> {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    // Check if test account exists in env or create one on the fly
    let user = process.env.ETHEREAL_USER;
    let pass = process.env.ETHEREAL_PASS;

    if (!user || !pass) {
      console.log('🔄 Creating new Ethereal Email test account...');
      const testAccount = await nodemailer.createTestAccount();
      user = testAccount.user;
      pass = testAccount.pass;
      console.log(`✅ Ethereal Email created: User: ${user}`);
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    return transporter;
  })();

  return transporterPromise;
}

export interface SendMailParams {
  from: string;
  to: string;
  subject: string;
  body: string;
}

export interface SendMailResult {
  messageId: string;
  previewUrl: string | false;
}

export async function sendEmail(params: SendMailParams): Promise<SendMailResult> {
  const transporter = await getEmailTransporter();

  const info = await transporter.sendMail({
    from: params.from,
    to: params.to,
    subject: params.subject,
    text: params.body,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>${params.body.replace(/\n/g, '<br/>')}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <small style="color: #888;">Sent via ReachInbox Scheduler Service</small>
    </div>`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`✉️ Email sent to ${params.to}! Preview URL: ${previewUrl}`);

  return {
    messageId: info.messageId,
    previewUrl,
  };
}
