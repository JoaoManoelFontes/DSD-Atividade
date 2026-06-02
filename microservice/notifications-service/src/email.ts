import nodemailer from "nodemailer";
import { config } from "./config.js";

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
});

export async function sendEmail(input: SendEmailInput) {
  return transporter.sendMail({
    from: config.smtp.from,
    ...input,
  });
}
