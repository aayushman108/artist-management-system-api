import { Resend } from "resend";
import path from "path";
import ejs from "ejs";
import fs from "fs";
import juice from "juice";
import dotenv from "dotenv";
import { ENV } from "../constants";
dotenv.config();

const resend = new Resend(ENV.RESEND_API_KEY);

interface IMailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

export async function sendMail(options: IMailOptions) {
  const templatePath = path.join(__dirname, "..", "emails", options.template);
  const cssPath = path.join(__dirname, "..", "emails", "style.css");

  const html = await ejs.renderFile(templatePath, options.data);
  const css = fs.readFileSync(cssPath, "utf8");

  const inlinedHtml = juice.inlineContent(html, css);

  const { data, error } = await resend.emails.send({
    from: ENV.RESEND_USER!,
    to: options.email,
    subject: options.subject,
    html: inlinedHtml,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
