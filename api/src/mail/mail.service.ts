import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.error(
        'MailService disabled: EMAIL_USER and/or EMAIL_PASS env vars are not set.',
      );
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }

  private async send(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
    attachments?: Array<{ filename: string; content: Buffer }>;
  }): Promise<void> {
    if (!this.transporter) {
      return; // silently skip if not configured
    }
    try {
      await this.transporter.sendMail({
        from: `"VetGuard Management System" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments || [],
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  async sendRegistrationReceived(to: string, fullName?: string) {
    const name = fullName ? `, ${fullName}` : '';
    await this.send({
      to,
      subject: 'Registration Received - VetGard',
      text:
        `Hello${name}, your registration was successful. ` +
        'Please wait for admin approval before you can access the system.',
      html:
        `<p>Hello${name},</p>` +
        `<p>Your registration was successful.</p>` +
        '<p>Please wait for admin approval before you can access the system.</p>',
    });
  }

  async sendRegistrationApproved(to: string, fullName?: string) {
    const name = fullName ? `, ${fullName}` : '';
    await this.send({
      to,
      subject: 'Account Approved - VetGard',
      text:
        `Hello${name}, your account has been approved. ` +
        'You can now log in and access the system.',
      html:
        `<p>Hello${name},</p>` +
        '<p>Your account has been <strong>approved</strong>.</p>' +
        '<p>You can now log in and access the system.</p>',
    });
  }

  async sendRegistrationRejected(
    to: string,
    fullName?: string,
    reason?: string,
  ) {
    const name = fullName ? `, ${fullName}` : '';
    const reasonText = reason ? ` Reason: ${reason}` : '';
    await this.send({
      to,
      subject: 'Registration Rejected - VetGard',
      text:
        `Hello${name}, your registration was rejected.${reasonText} ` +
        'You may update your information and try again.',
      html:
        `<p>Hello${name},</p>` +
        '<p>Your registration has been <strong>rejected</strong>.</p>' +
        (reason
          ? `<p><strong>Reason:</strong> ${this.escapeHtml(reason)}</p>`
          : '') +
        '<p>You may update your information and try again.</p>',
    });
  }

  async sendLicenseApproved(to: string, fullName?: string, pdfBuffer?: Buffer) {
    const name = fullName ? `, ${fullName}` : '';
    const attachments = pdfBuffer ? [
      {
        filename: `license_card.pdf`,
        content: pdfBuffer,
      },
    ] : [];
    
    await this.send({
      to,
      subject: 'License Approved - VetGard',
      text: `Hello${name}, your veterinary license application has been approved.` +
            (pdfBuffer ? ' Your license card is attached to this email.' : ''),
      html:
        `<p>Hello${name},</p>` +
        '<p>Your veterinary license application has been <strong>approved</strong>.</p>' +
        (pdfBuffer ? '<p>Your license card is attached to this email.</p>' : ''),
      attachments,
    });
  }

  async sendLicenseRejected(to: string, fullName?: string, reason?: string) {
    const name = fullName ? `, ${fullName}` : '';
    await this.send({
      to,
      subject: 'License Rejected - VetGard',
      text:
        `Hello${name}, your veterinary license application was rejected.` +
        (reason ? ` Reason: ${reason}` : ''),
      html:
        `<p>Hello${name},</p>` +
        '<p>Your veterinary license application has been <strong>rejected</strong>.</p>' +
        (reason
          ? `<p><strong>Reason:</strong> ${this.escapeHtml(reason)}</p>`
          : ''),
    });
  }

  private escapeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
