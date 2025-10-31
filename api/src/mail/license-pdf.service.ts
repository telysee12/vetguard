import { Injectable } from '@nestjs/common';
import { join } from 'path';
import type puppeteerNamespace from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LicensePdfService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a license card PDF and return its buffer
   */
  async generateLicenseCardPdf(applicationId: number): Promise<Buffer> {
    // Fetch complete application data with full vet info
    const application = await this.prisma.vetLicenseApplication.findUnique({
      where: { id: applicationId },
      include: {
        vet: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            province: true,
            district: true,
            sector: true,
            passportPhoto: true,
          },
        },
      },
    });

    if (!application || !application.vet) {
      throw new Error('Application or vet not found');
    }

    const { vet, licenseNumber, fieldOfPractice, createdAt } = application;

    // Calculate expiry date (1 year from creation)
    const issuedDate = new Date(createdAt);
    const expiryDate = new Date(issuedDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Format dates
    const formatDate = (date: Date): string => {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const day = date.getDate().toString().padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear().toString().slice(-2);
      return `${day}-${month}-${year}`;
    };

    const issuedStr = formatDate(issuedDate);
    const expiryStr = formatDate(expiryDate);
    const fullName = `${vet.firstName} ${vet.lastName}`;

    // Try high-fidelity HTML rendering with Puppeteer to match the downloadable format
    try {
      const puppeteer: typeof puppeteerNamespace = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

      const photoUrl = (() => {
        const p = vet.passportPhoto || '';
        if (!p) return '';
        if (p.startsWith('http://') || p.startsWith('https://')) return p;
        return `${baseUrl}${p.startsWith('/uploads/') ? p : `/uploads/${p}`}`;
      })();

      const html = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #f3f4f6; }
          .page { width: 800px; height: 1120px; padding: 24px; background: #fff; }
          .card { width: 740px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
          .top { display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
          .brand { display:flex; gap:8px; align-items: center; }
          .brand-title { font-size: 11px; font-weight: 700; }
          .brand-sub { font-size: 9px; color:#4b5563; margin-top: 2px; }
          .title { font-size: 10px; font-weight: 800; margin-top: 4px; }
          .lic-no { font-size: 10px; font-weight: 600; }
          .body { display:flex; gap: 12px; padding: 10px 12px; align-items: flex-start; }
          .photo { width: 70px; height: 90px; object-fit: cover; border: 1px solid #e5e7eb; border-radius: 3px; }
          .grid { flex: 1; display:grid; grid-template-columns: 1fr 1fr; row-gap: 6px; column-gap: 12px; font-size: 10px; }
          .label { font-weight: 700; }
          .bottom { padding: 12px; border-top: 1px solid #e5e7eb; background: #f9fafb; position: relative; }
          .rcvd { text-align:center; color:#166534; font-weight:800; font-size: 14px; letter-spacing: .5px; margin-bottom: 6px; }
          .p-line { text-align:center; font-size: 11px; font-weight: 700; margin: 6px 0; }
          .sign { position: absolute; bottom: 8px; font-size: 9px; font-weight: 800; color: #dc2626; }
          .sign.left { left: 10px; }
          .sign.right { right: 10px; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="card">
            <div class="top">
              <div>
                <div class="brand">
                  <div style="width:28px;height:28px;background:#1f2937;border-radius:4px;"></div>
                  <div>
                    <div class="brand-title">Rwanda Council of Veterinary Doctors</div>
                    <div class="brand-sub">In Pursuit of Quality and Reliable Veterinary Services</div>
                    <div class="title">LICENSE CARD</div>
                  </div>
                </div>
              </div>
              <div class="lic-no">Licence No: <b>${licenseNumber || ''}</b></div>
            </div>
            <div class="body">
              ${photoUrl ? `<img class=\"photo\" src=\"${photoUrl}\" />` : `<div class=\"photo\"></div>`}
              <div class="grid">
                <div><span class="label">Name:</span> ${fullName}</div>
                <div><span class="label">Issued:</span> ${issuedStr}</div>
                <div><span class="label">Field of practice:</span> ${fieldOfPractice || 'N/A'}</div>
                <div><span class="label">Expires:</span> ${expiryStr}</div>
                <div><span class="label">Professional area:</span> ${vet.sector || 'N/A'}, ${vet.district || 'N/A'}, ${vet.province || 'N/A'}</div>
              </div>
            </div>
            <div class="bottom">
              <div class="rcvd">RWANDA COUNCIL OF VETERINARY DOCTORS</div>
              <div class="p-line">This card is issued by RCVD and is strictly personal</div>
              <div class="p-line">It remains property of RCVD and must be returned on demand.</div>
              <div class="p-line">Please use it in accordance with veterinary code of ethics.</div>
              <div class="sign left">Executive Secretary</div>
              <div class="sign right">Chairperson</div>
            </div>
          </div>
        </div>
      </body>
      </html>`;

      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        printBackground: true,
        width: '800px',
        height: '1120px',
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      });
      await browser.close();
      return Buffer.from(pdf);
    } catch (e) {
      // Fallback by throwing; caller will send email without attachment
      throw new Error('Puppeteer not available or PDF generation failed');
    }
  }
}

