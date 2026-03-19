import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "onboarding@resend.dev";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your DevStash email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="margin: 0 0 16px;">Verify your email</h2>
        <p style="color: #666; line-height: 1.6;">
          Click the button below to verify your email address and activate your DevStash account.
        </p>
        <a
          href="${verifyUrl}"
          style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #18181b; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;"
        >
          Verify email
        </a>
        <p style="color: #999; font-size: 13px; line-height: 1.5;">
          This link expires in 24 hours. If you didn't create a DevStash account, you can ignore this email.
        </p>
      </div>
    `,
  });
}
