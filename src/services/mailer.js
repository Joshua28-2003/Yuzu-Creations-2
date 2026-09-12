const nodemailer = require('nodemailer');

let transport = null;

function configured() {
  return !!(process.env.MAIL_USER && process.env.MAIL_PASS);
}

function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
  return transport;
}

async function sendMail({ to, subject, html }) {
  if (!configured()) {
    throw new Error('Email service is not configured. Set MAIL_USER and MAIL_PASS in .env');
  }
  const t = getTransport();
  await t.verify();
  await t.sendMail({
    from: process.env.MAIL_FROM
      ? `"${process.env.MAIL_FROM}" <${process.env.MAIL_USER}>`
      : process.env.MAIL_USER,
    to,
    subject,
    html,
  });
}

function verificationHtml(code, minutes) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="background:#141414;padding:22px 28px">
        <h2 style="margin:0;color:#ffb347;font-size:20px">Yuzu Creation</h2>
      </div>
      <div style="padding:28px;color:#222">
        <h3>Verify your email</h3>
        <p style="font-size:15px;line-height:1.6">Use this code to verify your account. It expires in ${minutes} minutes.</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#e8791e;text-align:center;margin:24px 0">${code}</p>
        <p style="font-size:13px;color:#777">If you did not create this account, you can safely ignore this email.</p>
      </div>
    </div>`;
}

module.exports = { sendMail, verificationHtml, configured };