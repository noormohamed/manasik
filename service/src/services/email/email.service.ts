/**
 * Generic SMTP Email Service
 * 
 * Works with any SMTP provider (Mailtrap, SendGrid, Mailgun, Gmail, etc.)
 * Configure via environment variables.
 */

import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private defaultFrom: string;
  private isConfigured: boolean = false;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true';
    this.defaultFrom = process.env.SMTP_FROM || 'noreply@manasik.com';

    if (!host || !user || !pass) {
      console.warn('⚠️  SMTP not configured. Emails will be logged only.');
      console.warn('   Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    this.isConfigured = true;
    console.log(`✅ Email service configured (${host}:${port})`);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    if (!this.transporter || !this.isConfigured) {
      console.log('📧 [DEV] Email:', options.subject, '→', recipients);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: options.from || this.defaultFrom,
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
        replyTo: options.replyTo,
        attachments: options.attachments,
      });
      console.log('✅ Email sent:', options.subject, '→', recipients);
      return true;
    } catch (error: any) {
      console.error('❌ Email failed:', error.message);
      return false;
    }
  }

  async sendBookingConfirmation(email: string, details: {
    bookingId: string;
    guestName: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    total: number;
    currency: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Booking Confirmed - ${details.hotelName}`,
      html: this.bookingTemplate(details),
    });
  }

  async sendPasswordReset(email: string, userName: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Manasik',
      html: this.passwordResetTemplate(userName, resetUrl),
    });
  }

  async sendWelcome(email: string, userName: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to Manasik!',
      html: this.welcomeTemplate(userName),
    });
  }

  async sendPaymentReceipt(email: string, details: {
    guestName: string;
    amount: number;
    currency: string;
    paymentId: string;
    bookingId: string;
    hotelName: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Payment Receipt - ${details.hotelName}`,
      html: this.receiptTemplate(details),
    });
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private baseTemplate(content: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f4f4f4}
      .container{max-width:600px;margin:0 auto;background:#fff;padding:40px}
      .header{text-align:center;padding-bottom:20px;border-bottom:2px solid #2563eb}
      .logo{font-size:28px;font-weight:bold;color:#2563eb}
      .content{padding:30px 0}
      h1{color:#1f2937;font-size:24px}
      .btn{display:inline-block;padding:14px 32px;background:#2563eb;color:#fff!important;text-decoration:none;border-radius:6px;font-weight:600;margin:20px 0}
      .box{background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0}
      .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e5e7eb}
      .row:last-child{border-bottom:none}
      .footer{padding-top:20px;border-top:2px solid #f0f0f0;text-align:center;color:#6b7280;font-size:14px}
    </style></head><body><div class="container">
      <div class="header"><div class="logo">Manasik</div></div>
      <div class="content">${content}</div>
      <div class="footer"><p>© ${new Date().getFullYear()} Manasik</p></div>
    </div></body></html>`;
  }

  private bookingTemplate(d: { bookingId: string; guestName: string; hotelName: string; roomType: string; checkIn: string; checkOut: string; nights: number; total: number; currency: string }): string {
    return this.baseTemplate(`
      <div style="text-align:center"><span style="background:#10b981;color:#fff;padding:8px 16px;border-radius:20px">✓ Booking Confirmed</span></div>
      <h1>Thank you for your booking!</h1>
      <p>Hi ${d.guestName},</p>
      <p>Your booking has been confirmed:</p>
      <div class="box">
        <div class="row"><span>Booking ID</span><span><b>${d.bookingId}</b></span></div>
        <div class="row"><span>Hotel</span><span><b>${d.hotelName}</b></span></div>
        <div class="row"><span>Room</span><span>${d.roomType}</span></div>
        <div class="row"><span>Check-in</span><span>${d.checkIn}</span></div>
        <div class="row"><span>Check-out</span><span>${d.checkOut}</span></div>
        <div class="row"><span>Duration</span><span>${d.nights} night(s)</span></div>
        <div class="row"><span>Total</span><span style="color:#2563eb;font-size:18px"><b>${d.currency} ${d.total.toFixed(2)}</b></span></div>
      </div>
      <p>We look forward to welcoming you!</p>
    `);
  }

  private passwordResetTemplate(userName: string, resetUrl: string): string {
    return this.baseTemplate(`
      <h1>Reset Your Password</h1>
      <p>Hi ${userName},</p>
      <p>Click below to reset your password:</p>
      <div style="text-align:center"><a href="${resetUrl}" class="btn">Reset Password</a></div>
      <p style="font-size:12px;color:#6b7280">Or copy: ${resetUrl}</p>
      <div class="box" style="background:#fef3c7;border-left:4px solid #f59e0b">
        <p style="margin:0;color:#92400e"><b>⚠️</b> Link expires in 1 hour. Ignore if you didn't request this.</p>
      </div>
    `);
  }

  private welcomeTemplate(userName: string): string {
    const url = process.env.FRONTEND_URL || 'http://localhost:3000';
    return this.baseTemplate(`
      <h1>Welcome to Manasik! 🎉</h1>
      <p>Hi ${userName},</p>
      <p>Thanks for joining! You can now:</p>
      <div class="box">
        <p>✓ Book hotels worldwide</p>
        <p>✓ Discover unique experiences</p>
        <p>✓ Manage bookings in one place</p>
        <p>✓ Get 24/7 support</p>
      </div>
      <div style="text-align:center"><a href="${url}" class="btn">Start Exploring</a></div>
    `);
  }

  private receiptTemplate(d: { guestName: string; amount: number; currency: string; paymentId: string; bookingId: string; hotelName: string }): string {
    return this.baseTemplate(`
      <h1>Payment Receipt</h1>
      <p>Hi ${d.guestName},</p>
      <p>Thank you for your payment:</p>
      <div class="box">
        <div class="row"><span>Payment ID</span><span>${d.paymentId}</span></div>
        <div class="row"><span>Booking ID</span><span>${d.bookingId}</span></div>
        <div class="row"><span>Hotel</span><span>${d.hotelName}</span></div>
        <div class="row"><span>Amount</span><span style="color:#10b981;font-size:20px"><b>${d.currency} ${d.amount.toFixed(2)}</b></span></div>
      </div>
    `);
  }
}

export const emailService = new EmailService();
