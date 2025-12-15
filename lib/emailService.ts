import transport from "./nodemailer";

interface EmailData {
  to: string;
  merchantName: string;
  amount: number;
  category: string;
  receiptDate: string;
  fileName: string;
}

export async function sendProcessingCompleteEmail(emailData: EmailData): Promise<boolean> {
  try {
    const { to, merchantName, amount, category, receiptDate, fileName } = emailData;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt Processing Complete</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            width: 48px;
            height: 48px;
            background-color: #2E86DE;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          .logo-text {
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .title {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
          }
          .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin: 8px 0 0 0;
          }
          .success-badge {
            background-color: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 24px;
          }
          .receipt-details {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #374151;
          }
          .detail-value {
            color: #1f2937;
            font-weight: 500;
          }
          .amount {
            font-size: 20px;
            font-weight: 700;
            color: #2E86DE;
          }
          .cta-button {
            background-color: #2E86DE;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
            margin: 24px 0;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background-color: #2574C7;
          }
          .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            .container {
              padding: 24px;
            }
            .detail-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span class="logo-text">R</span>
            </div>
            <h1 class="title">Receipt Processing Complete!</h1>
            <p class="subtitle">Your receipt has been successfully processed</p>
          </div>
          
          <div class="success-badge">
            ✓ Processing Complete
          </div>
          
          <p>Hi there! Great news! Your receipt has been successfully processed and the information has been extracted.</p>
          
          <div class="receipt-details">
            <div class="detail-row">
              <span class="detail-label">Merchant:</span>
              <span class="detail-value">${merchantName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span class="detail-value amount">$${amount.toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value">${category}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${receiptDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">File:</span>
              <span class="detail-value">${fileName}</span>
            </div>
          </div>
          
          <p>You can now review and edit the extracted information in your dashboard. If anything looks incorrect, you can easily make changes before finalizing your expense report.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="cta-button">
              View in Dashboard
            </a>
          </div>
          
          <div class="footer">
            <p>This email was sent from ReimburseMe - Your smart receipt processing solution</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: 'ReimburseMe',
        address: process.env.APP_EMAIL || 'noreply@reimburseme.com'
      },
      to,
      subject: '🎉 Your receipt processing is complete!',
      html: emailHtml,
    };

    await transport.sendMail(mailOptions);
    console.log('Processing complete email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Failed to send processing complete email:', error);
    return false;
  }
}

export async function sendProcessingFailedEmail(emailData: {
  to: string;
  fileName: string;
  errorMessage?: string;
}): Promise<boolean> {
  try {
    const { to, fileName, errorMessage } = emailData;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receipt Processing Failed</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            width: 48px;
            height: 48px;
            background-color: #ef4444;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          .logo-text {
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .title {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
          }
          .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin: 8px 0 0 0;
          }
          .error-badge {
            background-color: #ef4444;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 24px;
          }
          .info-box {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .info-title {
            font-weight: 600;
            color: #92400e;
            margin: 0 0 8px 0;
          }
          .info-text {
            color: #92400e;
            margin: 0;
          }
          .cta-button {
            background-color: #2E86DE;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
            margin: 24px 0;
            transition: background-color 0.2s;
          }
          .cta-button:hover {
            background-color: #2574C7;
          }
          .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span class="logo-text">!</span>
            </div>
            <h1 class="title">Receipt Processing Issue</h1>
            <p class="subtitle">We couldn't process your receipt automatically</p>
          </div>
          
          <div class="error-badge">
            ⚠ Processing Failed
          </div>
          
          <p>Hi there! Unfortunately, we encountered an issue while processing your receipt. Don't worry - you can still manually enter the details.</p>
          
          <div class="info-box">
            <h3 class="info-title">What happened?</h3>
            <p class="info-text">${errorMessage || 'The OCR processing encountered an error and was unable to extract information from your receipt automatically.'}</p>
          </div>
          
          <p><strong>File:</strong> ${fileName}</p>
          
          <p>You can still upload your receipt and manually enter the details. Our system will save it for your expense reports.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/upload" class="cta-button">
              Try Again
            </a>
          </div>
          
          <div class="footer">
            <p>This email was sent from ReimburseMe - Your smart receipt processing solution</p>
            <p>If you continue to have issues, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: 'ReimburseMe',
        address: process.env.APP_EMAIL || 'noreply@reimburseme.com'
      },
      to,
      subject: 'Receipt processing issue - Manual entry required',
      html: emailHtml,
    };

    await transport.sendMail(mailOptions);
    console.log('Processing failed email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Failed to send processing failed email:', error);
    return false;
  }
}