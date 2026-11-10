import nodemailer from "nodemailer";
import config from "./index";

export const senderMail = config.smtp.from;

// When SMTP_HOST is not set, emails are serialized and logged to the console instead of sent.
const baseTransport = config.smtp.host
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  : nodemailer.createTransport({ jsonTransport: true });

export const transport = {
  sendMail: async (mailOptions: nodemailer.SendMailOptions) => {
    if (!config.smtp.host) {
      const recipient = Array.isArray(mailOptions.to)
        ? mailOptions.to.join(", ")
        : mailOptions.to;
      console.log("\n📬 ================ [EMAIL DISPATCHED (DEV/DEMO)] ================");
      console.log(`To:      ${recipient}`);
      console.log(`From:    ${mailOptions.from || senderMail}`);
      console.log(`Subject: ${mailOptions.subject}`);
      if (mailOptions.text) {
        console.log(`Content: ${mailOptions.text}`);
      }
      console.log("==================================================================\n");
    }
    return baseTransport.sendMail(mailOptions);
  },
};
