import nodemailer from "nodemailer";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const sendContactEmail = async ({ name, email, subject, message }) => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL || "gbherbarium@gmail.com";
  const text = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
  const html = `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <hr>
    <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`;

  if (gmailUser && gmailAppPassword) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword.replaceAll(" ", "")
      }
    });
    await transporter.sendMail({
      from: `GB Herbarium <${gmailUser}>`,
      to: recipient,
      replyTo: email,
      subject: `[Herbarium inquiry] ${subject}`,
      text,
      html
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Email delivery is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD, or RESEND_API_KEY and EMAIL_FROM.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: email,
      subject: `[Herbarium inquiry] ${subject}`,
      text,
      html
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend rejected the message (${response.status}): ${errorBody}`);
  }

  return response.json();
};

export { sendContactEmail };