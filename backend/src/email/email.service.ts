import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'isabel.mio47@gmail.com',
        pass: 'pebrkwzuhqvn mozc', 
      },
    });
  }

  async sendInviteEmail(to: string, name: string, link: string) {
    const mailOptions = {
      from: '"CodeOverload Recruiting" <isabel.mio47@gmail.com>',
      to: to,
      subject: 'Invitație Test Tehnic - CodeOverload',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Salut, ${name}!</h2>
          <p>Ai fost invitat să susții un test tehnic.</p>
          <p>Apasă butonul de mai jos pentru a începe examenul:</p>
          <a href="${link}" style="background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Începe Examenul
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Acest link este unic și securizat.</p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }
}