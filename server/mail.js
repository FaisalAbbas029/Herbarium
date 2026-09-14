import nodemailer from "nodemailer";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function getMailConfigStatus() {
  const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;
  const gmailAppPass = process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.replaceAll(" ", "").trim() : null;
  const resendApiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : null;
  const emailFrom = process.env.EMAIL_FROM ? process.env.EMAIL_FROM.trim() : null;

  return {
    gmailConfigured: Boolean(gmailUser && gmailAppPass),
    resendConfigured: Boolean(resendApiKey && emailFrom),
    gmailUser,
    gmailAppPass,
    resendApiKey,
    emailFrom
  };
}

async function trySendViaGmail({ to, subject, text, html, replyTo, senderDisplayName = "GB Herbarium" }) {
  const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : null;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.replaceAll(" ", "").trim() : null;

  if (!gmailUser || !gmailAppPassword) {
    throw new Error("Gmail credentials missing (GMAIL_USER or GMAIL_APP_PASSWORD not set)");
  }

  console.log("[MAIL] Provider: Gmail SMTP");
  console.log("[MAIL] Gmail SMTP verification started");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailAppPassword
    }
  });

  try {
    await transporter.verify();
    console.log("[MAIL] Gmail SMTP verification successful");
    console.log("[MAIL] SMTP connection successful");
  } catch (verifyErr) {
    console.error(`[MAIL] Gmail SMTP verification failed: ${verifyErr.message}`);
    throw verifyErr;
  }

  const mailOptions = {
    from: `"${senderDisplayName}" <${gmailUser}>`,
    to,
    subject,
    text,
    html
  };
  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  const info = await transporter.sendMail(mailOptions);
  console.log("[MAIL] Invitation email accepted");
  console.log(`[MAIL] Message ID: ${info.messageId}`);
  return { success: true, provider: "gmail", messageId: info.messageId };
}

async function trySendViaResend({ to, subject, text, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : null;
  const from = process.env.EMAIL_FROM ? process.env.EMAIL_FROM.trim() : null;

  if (!apiKey || !from) {
    throw new Error("Resend credentials missing (RESEND_API_KEY or EMAIL_FROM not set)");
  }

  console.log("[MAIL] Provider: Resend");
  const payload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html
  };
  if (replyTo) {
    payload.reply_to = replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend rejected the message (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  console.log("[MAIL] Resend delivery accepted");
  console.log(`[MAIL] Message ID: ${data?.id || "N/A"}`);
  return { success: true, provider: "resend", messageId: data?.id };
}

async function sendWithFallback({ to, subject, text, html, replyTo, senderDisplayName = "GB Herbarium" }) {
  const { gmailConfigured, resendConfigured } = getMailConfigStatus();

  if (!gmailConfigured && !resendConfigured) {
    throw new Error("Email delivery is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD, or RESEND_API_KEY and EMAIL_FROM.");
  }

  let gmailError = null;

  if (gmailConfigured) {
    try {
      return await trySendViaGmail({ to, subject, text, html, replyTo, senderDisplayName });
    } catch (err) {
      gmailError = err;
      console.error(`[MAIL] Gmail delivery failed: ${err.message}`);
      if (!resendConfigured) {
        throw new Error(`Gmail SMTP delivery failed: ${err.message}`);
      }
      console.log("[MAIL] Attempting Resend fallback");
    }
  }

  if (resendConfigured) {
    try {
      return await trySendViaResend({ to, subject, text, html, replyTo });
    } catch (resendErr) {
      console.error(`[MAIL] Resend delivery failed: ${resendErr.message}`);
      if (gmailError) {
        throw new Error(`Gmail failed (${gmailError.message}) and Resend fallback also failed (${resendErr.message})`);
      }
      throw new Error(`Resend delivery failed: ${resendErr.message}`);
    }
  }
}

const sendContactEmail = async ({ name, email, subject, message }) => {
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL || "gbherbarium@gmail.com";
  console.log(`[MAIL] Sending contact inquiry email to: ${recipient}`);

  const text = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
  const html = `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <hr>
    <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`;

  return sendWithFallback({
    to: recipient,
    subject: `[Herbarium inquiry] ${subject}`,
    text,
    html,
    replyTo: email
  });
};

const sendAdminInvitationEmail = async ({
  name,
  email,
  role = "curator",
  inviteUrl,
  initialCredentialInstructions,
  frontendUrl
}) => {
  console.log(`[MAIL] Sending admin invitation to: ${email}`);

  const siteUrl = (
    frontendUrl ||
    process.env.APP_URL ||
    (process.env.NODE_ENV === "production" ? "https://herbariumgb.netlify.app" : "http://localhost:3000")
  ).trim().replace(/\/+$/, "");

  const invitationLink = inviteUrl || `${siteUrl}/accept-invitation`;
  const credentialText = initialCredentialInstructions || `Please use your invitation link below to set your password and activate your account:\n${invitationLink}`;
  const isSuperAdminRole = role === "superadmin";
  const roleLabel = isSuperAdminRole ? "Super Admin" : "Admin";

  const text = `Hello ${name},

You have been invited to join GB Herbarium as ${isSuperAdminRole ? "a Super Admin" : "an Admin"}.
${isSuperAdminRole ? "As a Super Admin, you can access the GB Herbarium administration panel, manage botanical specimens, and manage administrators." : "As an Admin, you can access the GB Herbarium administration panel and help add and manage botanical specimens."}

Email:
${email}

Assigned Role:
${roleLabel}

Initial Password / Invitation:
${credentialText}

For security, please change your password after your first login.

Visit GB Herbarium:
${siteUrl}

After logging in, you can access the Admin Panel and begin adding specimens.

If you did not expect this invitation, please contact the GB Herbarium administrator.

Regards,
GB Herbarium Team`;

  const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1C241E; background-color: #FAF8F5; border: 1px solid #E0D9CE; border-radius: 4px;">
    <div style="border-bottom: 2px solid #1F4529; padding-bottom: 12px; margin-bottom: 20px;">
      <h2 style="color: #1F4529; margin: 0; font-size: 20px;">GB Herbarium Archive</h2>
    </div>
    <p>Hello <strong>${escapeHtml(name)}</strong>,</p>
    <p>You have been invited to join <strong>GB Herbarium</strong> as <strong>${escapeHtml(roleLabel)}</strong>.</p>
    <p>${isSuperAdminRole ? "As a Super Admin, you can access the GB Herbarium administration panel, manage botanical specimens, and manage administrators." : "As an Admin, you can access the GB Herbarium administration panel and help add and manage botanical specimens."}</p>
    
    <div style="background-color: #FFFFFF; border: 1px solid #EDE7DD; border-radius: 4px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin: 0 0 10px 0;"><strong>Assigned Role:</strong> <span style="display: inline-block; background-color: ${isSuperAdminRole ? "#1F4529" : "#EDE7DD"}; color: ${isSuperAdminRole ? "#FFFFFF" : "#1C241E"}; padding: 2px 8px; font-size: 11px; font-weight: bold; border-radius: 3px; text-transform: uppercase;">${escapeHtml(roleLabel)}</span></p>
      <p style="margin: 0 0 10px 0;"><strong>Initial Password / Invitation:</strong></p>
      <p style="margin: 0 0 12px 0; color: #3D443F;">${escapeHtml(credentialText).replaceAll("\n", "<br>")}</p>
      <div style="margin-top: 14px;">
        <a href="${escapeHtml(invitationLink)}" style="display: inline-block; background-color: #1F4529; color: #FFFFFF; text-decoration: none; padding: 10px 20px; font-weight: 600; font-size: 13px; border-radius: 3px;">Accept ${escapeHtml(roleLabel)} Invitation & Set Password</a>
      </div>
    </div>

    <p style="font-size: 13px; color: #566158;">For security, please change your password after your first login.</p>
    <p style="font-size: 13px; color: #566158;">Visit GB Herbarium: <a href="${escapeHtml(siteUrl)}" style="color: #1F4529; text-decoration: underline;">${escapeHtml(siteUrl)}</a></p>
    <p style="font-size: 13px; color: #566158;">After logging in, you can access the Admin Panel and begin adding specimens.</p>
    <hr style="border: 0; border-top: 1px solid #EDE7DD; margin: 24px 0 16px 0;" />
    <p style="font-size: 12px; color: #8E9990; margin-bottom: 4px;">If you did not expect this invitation, please contact the GB Herbarium administrator.</p>
    <p style="font-size: 12px; color: #8E9990; margin: 0;">Regards,<br><strong>GB Herbarium Team</strong></p>
  </div>`;

  const subject = isSuperAdminRole
    ? "You’re Invited to Join GB Herbarium as a Super Admin"
    : "You’re Invited to Join GB Herbarium as an Admin";

  return sendWithFallback({
    to: email,
    subject,
    text,
    html
  });
};

export { sendContactEmail, sendAdminInvitationEmail, getMailConfigStatus };