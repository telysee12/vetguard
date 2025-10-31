# License Card PDF Email Setup

## Overview

This feature automatically generates and emails a license card PDF when a license application is approved from the district dashboard.

## Installation

### 1. Install Required Dependencies

The system uses **PDFKit** to generate PDF files. Run the following command in the `api` directory:

```bash
cd api
npm install pdfkit @types/pdfkit
```

## Configuration

### 2. Email Configuration

Ensure your `.env` file in the `api` directory has the following email settings:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Note:** For Gmail, you need to use an "App Password" instead of your regular password. Enable 2-factor authentication and generate an app password from your Google Account settings.

## Files Modified/Created

### Created Files:
- `api/src/mail/license-pdf.service.ts` - Service for generating PDF license cards

### Modified Files:
- `api/src/mail/mail.service.ts` - Added attachment support to email service
- `api/src/mail/mail.module.ts` - Exported LicensePdfService
- `api/src/license-applications/license-applications.service.ts` - Integrated PDF generation on approval

## How It Works

1. When a district vet approves a license application from `/district-dashboard`:
   - The `updateStatus` method is called with status `'APPROVED'`
   
2. The system automatically:
   - Fetches complete vet and application data from the database
   - Generates a PDF license card with all relevant information
   - Attaches the PDF to the approval email
   - Sends the email to the veterinarian
   
3. The PDF includes:
   - Front side: Vet name, photo, license number, field of practice, issue/expiry dates, professional area
   - Back side: Official statements, signatures, RCVD branding

4. If PDF generation fails, the system falls back to sending email without attachment

## Testing

To test the feature:

1. Start your development server:
   ```bash
   cd api
   npm run start:dev
   ```

2. Open the district dashboard at `http://localhost:8080/district-dashboard`

3. Approve a pending license application

4. Check the veterinarian's email for the license card PDF attachment

## Troubleshooting

### PDF Generation Fails

If PDF generation fails, check:
- PDFKit is installed: `npm list pdfkit`
- Console logs for specific error messages
- The system will fall back to sending email without attachment

### Email Not Sending

If emails aren't being sent:
- Verify `.env` has correct `EMAIL_USER` and `EMAIL_PASS`
- Check console logs for email errors
- Ensure your email provider allows SMTP connections

### License Card Layout Issues

The PDF uses standard dimensions (3.375" x 2.125"). If layout looks incorrect:
- Check browser console for any warnings
- Verify all vet data is properly populated in the database

## Future Enhancements

Potential improvements:
- Add actual vet photo to PDF (requires base64 image conversion)
- Add RCVD logo/branding images
- Customize colors and styling
- Add QR codes for license verification

