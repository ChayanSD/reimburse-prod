export interface ReportMeta {
  report_id: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  currency?: string;
  locale?: string;
}

export interface Submitter {
  name: string;
  email: string;
  title?: string;
  employee_id?: string;
  department?: string;
}

export interface Recipient {
  company_name: string;
  approver_name: string;
  approver_email: string;
  address_lines?: string[];
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface Summary {
  total_reimbursable: number;
  non_reimbursable: number;
  per_diem_days?: number;
  totals_by_category?: CategoryTotal[];
}

export interface LineItem {
  date: string;
  merchant: string;
  category: string;
  notes?: string;
  amount: number;
  converted_amount?: number;
  file_url?: string;
  policy_flag?: boolean;
}

export interface Branding {
  template?: string;
}

export interface Appendix {
  include_receipt_gallery?: boolean;
}

export interface Policy {
  notes?: string[];
}

export interface Signoff {
  submitter_signature_text?: string;
}

export interface ExpenseReportData {
  reportMeta: ReportMeta;
  submitter: Submitter;
  recipient: Recipient;
  branding?: Branding;
  summary?: Summary;
  line_items?: LineItem[];
  policy?: Policy;
  appendix?: Appendix;
  signoff?: Signoff;
}

// HTML sanitization helper
function sanitizeHTML(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function generateHTML(data: ExpenseReportData): string {
  const template = data.branding?.template || "Classic";

  switch (template) {
    case "Compact":
      return generateCompactTemplate(data);
    case "Executive":
      return generateExecutiveTemplate(data);
    default:
      return generateReimburseMeTemplate(data);
  }
}

function generateReimburseMeTemplate(data: ExpenseReportData): string {
  const {
    reportMeta,
    submitter,
    recipient,
    summary,
    line_items = [],
    policy,
  } = data;
  const showAppendix =
    data.appendix?.include_receipt_gallery && line_items.length > 0;
  const totalPages =
    Math.ceil(line_items.length / 15) +
    (showAppendix ? Math.ceil(line_items.length / 9) : 0) +
    1;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ReimburseMe Expense Report - ${reportMeta.report_id}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @media print {
      .page-break { page-break-before: always; }
      .no-page-break { page-break-inside: avoid; }
    }
    
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #374151;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .container {
      width: 8.5in;
      margin: 0 auto;
      background: white;
    }
    
    .page {
      min-height: 11in;
      padding: 0.5in 0.75in;
      position: relative;
      background: white;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: -0.5in -0.75in 0 -0.75in;
      padding: 24px 0.75in;
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border-bottom: 3px solid #2E86DE;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      margin-bottom: 28px;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    
    .logo {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: white;
      box-shadow: 0 4px 12px rgba(46, 134, 222, 0.15);
      border: 1px solid #E5E7EB;
      padding: 6px;
    }
    
    .logo-image {
      width: 40px;
      height: 40px;
      object-fit: contain;
      border-radius: 8px;
    }
    
    .brand-info h1 {
      font-family: 'Poppins', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #1F2937;
      margin-bottom: 2px;
      line-height: 1.2;
    }
    
    .tagline {
      font-size: 13px;
      color: #6B7280;
      font-style: italic;
      line-height: 1.4;
    }
    
    .report-meta {
      text-align: right;
      color: #374151;
    }
    
    .report-title {
      font-family: 'Poppins', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: #2E86DE;
      margin-bottom: 10px;
      line-height: 1.3;
    }
    
    .meta-item {
      margin: 4px 0;
      font-size: 11px;
      line-height: 1.5;
    }
    
    .meta-label {
      font-weight: 600;
      color: #4B5563;
    }
    
    /* Info Cards */
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    
    .info-card {
      background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
      border: 1px solid rgba(46, 134, 222, 0.1);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
    }
    
    .info-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #2E86DE 0%, #10B981 100%);
    }
    
    .card-title {
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #2E86DE;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      line-height: 1.4;
    }
    
    .card-content {
      font-size: 11px;
      line-height: 1.7;
    }
    
    .card-content div {
      margin-bottom: 5px;
    }
    
    .card-content div:last-child {
      margin-bottom: 0;
    }
    
    .card-content strong {
      font-weight: 600;
      color: #1F2937;
    }
    
    /* Summary Overview */
    .summary-overview {
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%);
      border: 1px solid rgba(46, 134, 222, 0.1);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 28px;
      position: relative;
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
    }
    
    .summary-overview::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #2E86DE 0%, #10B981 100%);
      border-radius: 20px 20px 0 0;
    }
    
    .summary-header {
      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 20px;
      line-height: 1.4;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 18px;
      margin-bottom: 24px;
    }
    
    .summary-stat {
      background: white;
      border-radius: 16px;
      padding: 22px 18px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border: 1px solid rgba(46, 134, 222, 0.1);
      position: relative;
      overflow: hidden;
    }
    
    .summary-stat::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #2E86DE 0%, #10B981 100%);
    }
    
    .stat-value {
      font-family: 'Poppins', sans-serif;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 6px;
      line-height: 1.2;
    }
    
    .stat-value.positive { color: #10B981; }
    .stat-value.negative { color: #EF4444; }
    .stat-value.neutral { color: #2E86DE; }
    
    .stat-label {
      font-size: 10px;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
      line-height: 1.4;
    }
    
    .period-info {
      background: white;
      border-radius: 10px;
      padding: 14px;
      font-size: 12px;
      text-align: center;
      color: #4B5563;
      border: 1px solid #E5E7EB;
      line-height: 1.5;
    }
    
    /* Receipts Table */
    .receipts-section {
      margin-bottom: 28px;
    }
    
    .section-title {
      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      line-height: 1.4;
    }
    
    .table-container {
      background: white;
      border: 1px solid rgba(46, 134, 222, 0.1);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th {
      background: #2E86DE;
      color: white;
      padding: 15px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #1E40AF;
      line-height: 1.4;
    }
    
    th.amount-col { text-align: right; }
    
    td {
      padding: 14px;
      border-bottom: 1px solid #F3F4F6;
      font-size: 10px;
      vertical-align: top;
      line-height: 1.6;
    }
    
    tbody tr:nth-child(even) {
      background: #F9FAFB;
    }
    
    tbody tr:hover {
      background: #F3F4F6;
    }
    
    tbody tr:last-child td {
      border-bottom: none;
    }
    
    .amount {
      text-align: right;
      font-weight: 600;
      font-family: 'Inter', monospace;
    }
    
    .amount.positive { color: #10B981; }
    .amount.negative { color: #EF4444; }
    
    .receipt-link {
      color: #2E86DE;
      text-decoration: none;
      font-weight: 500;
      font-size: 9px;
      line-height: 1.5;
    }
    
    .receipt-link:hover {
      text-decoration: underline;
    }
    
    .policy-flag {
      color: #EF4444;
      font-weight: 700;
      font-size: 11px;
      line-height: 1.4;
    }
    
    .policy-ok {
      color: #10B981;
      font-weight: 700;
      font-size: 11px;
      line-height: 1.4;
    }
    
    .notes {
      max-width: 150px;
      word-wrap: break-word;
      font-size: 9px;
      color: #6B7280;
      line-height: 1.5;
    }
    
    /* Category Breakdown */
    .category-section {
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border: 1px solid rgba(46, 134, 222, 0.1);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      position: relative;
    }
    
    .category-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #2E86DE 0%, #10B981 100%);
      border-radius: 16px 16px 0 0;
    }
    
    .category-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 2fr;
      gap: 20px;
      align-items: start;
    }
    
    .category-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    
    .category-table th {
      background: #374151;
      color: white;
      padding: 12px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      line-height: 1.4;
    }
    
    .category-table td {
      padding: 12px;
      border-bottom: 1px solid #E5E7EB;
      font-size: 11px;
      line-height: 1.6;
    }
    
    .category-table tbody tr:last-child td {
      border-bottom: none;
    }
    
    .grand-total {
      background: #2E86DE;
      color: white;
      font-weight: 700;
      font-size: 13px;
    }
    
    .grand-total td {
      border-bottom: none;
      padding: 14px 12px;
    }
    
    .currency-note {
      font-size: 10px;
      color: #6B7280;
      font-style: italic;
      line-height: 1.7;
    }
    
    /* Sign-off Section */
    .signoff-section {
      background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
      border: 1px solid rgba(46, 134, 222, 0.1);
      border-radius: 12px;
      padding: 24px;
      margin: 28px 0;
      page-break-inside: avoid;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      position: relative;
    }
    
    .signoff-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #2E86DE 0%, #10B981 100%);
      border-radius: 16px 16px 0 0;
    }
    
    .certification-text {
      font-size: 12px;
      color: #374151;
      margin-bottom: 28px;
      font-style: italic;
      line-height: 1.7;
    }
    
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }
    
    .signature-block {
      text-align: center;
    }
    
    .signature-title {
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 10px;
      font-size: 12px;
      line-height: 1.4;
    }
    
    .signature-line {
      border-bottom: 2px solid #9CA3AF;
      margin: 36px 0 10px 0;
      height: 2px;
    }
    
    .signature-label {
      font-size: 10px;
      color: #6B7280;
      line-height: 1.4;
    }
    
    /* Footer */
    .footer {
      position: absolute;
      bottom: 0.4in;
      left: 0.75in;
      right: 0.75in;
      padding-top: 12px;
      border-top: 1px solid #E5E7EB;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #6B7280;
      line-height: 1.5;
    }
    
    .footer-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .footer-right {
      font-weight: 500;
    }
    
    /* Appendix */
    .appendix-section {
      page-break-before: always;
    }
    
    .receipt-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
      margin-top: 22px;
    }
    
    .receipt-thumbnail {
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      padding: 14px;
      text-align: center;
      background: #F9FAFB;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    
    .thumbnail-placeholder {
      width: 100%;
      height: 120px;
      background: #E5E7EB;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6B7280;
      font-size: 10px;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    
    .thumbnail-info {
      font-size: 9px;
      color: #374151;
      line-height: 1.6;
    }
    
    .thumbnail-info div {
      margin-bottom: 3px;
    }
    
    .thumbnail-info div:last-child {
      margin-bottom: 0;
    }
    
    .thumbnail-amount {
      font-weight: 600;
      color: #10B981;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="page">
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          <div class="logo">
            <img
              src="https://ucarecdn.com/6b43f5cf-10b4-4838-b2ba-397c0a896734/-/format/auto/"
              alt="ReimburseMe Logo"
              class="logo-image"
              width="40"
              height="40"
              style="width: 40px; height: 40px; object-fit: contain;"
            />
          </div>
          <div class="brand-info">
            <h1>ReimburseMe</h1>
            <div class="tagline">Your receipts. Reimbursed. Instantly.</div>
          </div>
        </div>
        <div class="report-meta">
          <div class="report-title">Expense Report — ${formatMonthYear(reportMeta.period_start)}</div>
          <div class="meta-item"><span class="meta-label">Generated on:</span> ${formatDate(reportMeta.generated_at)}</div>
          <div class="meta-item"><span class="meta-label">Report ID:</span> ${reportMeta.report_id}</div>
          <div class="meta-item"><span class="meta-label">Currency:</span> ${reportMeta.currency || "USD"}</div>
          <div class="meta-item"><span class="meta-label">Page:</span> 1 of ${totalPages}</div>
        </div>
      </div>

      <!-- Submitter & Company Info -->
      <div class="info-section">
        <div class="info-card">
          <div class="card-title">👤 Submitted By</div>
          <div class="card-content">
            <div><strong>${sanitizeHTML(submitter.name)}</strong></div>
            <div>${sanitizeHTML(submitter.email)}</div>
            ${submitter.title ? `<div>${sanitizeHTML(submitter.title)}</div>` : ''}
            <div><strong>Employee ID:</strong> ${sanitizeHTML(submitter.employee_id || "N/A")}</div>
            <div><strong>Department:</strong> ${sanitizeHTML(submitter.department || "General")}</div>
          </div>
        </div>
        
        <div class="info-card">
          <div class="card-title">🏢 Recipient</div>
          <div class="card-content">
            <div><strong>${sanitizeHTML(recipient.company_name)}</strong></div>
            <div>${sanitizeHTML(recipient.approver_name)}</div>
            <div>${sanitizeHTML(recipient.approver_email)}</div>
            ${recipient.address_lines ? recipient.address_lines.map((line: string) => `<div>${sanitizeHTML(line)}</div>`).join("") : ""}
          </div>
        </div>
      </div>

      <!-- Summary Overview -->
      <div class="summary-overview">
        <div class="summary-header">📊 Summary Overview</div>
        <div class="summary-grid">
          <div class="summary-stat">
            <div class="stat-value positive">$${formatCurrency(summary?.total_reimbursable || 0)}</div>
            <div class="stat-label">Total Reimbursable 🟢</div>
          </div>
          <div class="summary-stat">
            <div class="stat-value negative">$${formatCurrency(summary?.non_reimbursable || 0)}</div>
            <div class="stat-label">Non-Reimbursable 🔴</div>
          </div>
          <div class="summary-stat">
            <div class="stat-value neutral">${line_items.length}</div>
            <div class="stat-label">Receipts Submitted</div>
          </div>
          <div class="summary-stat">
            <div class="stat-value neutral">${summary?.per_diem_days || 0}</div>
            <div class="stat-label">Per Diem Days</div>
          </div>
        </div>
        <div class="period-info">
          <strong>Period:</strong> ${formatDate(reportMeta.period_start)} → ${formatDate(reportMeta.period_end)}
        </div>
      </div>

      <!-- Detailed Receipts Table -->
      <div class="receipts-section">
        <div class="section-title">🧾 Detailed Receipts</div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Description</th>
                <th class="amount-col">Amount</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              ${line_items
                .map(
                  (item: LineItem) => `
                <tr>
                  <td>${formatDate(item.date)}</td>
                  <td><strong>${sanitizeHTML(item.merchant)}</strong></td>
                  <td>
                    <span style="background: #E0F2FE; color: #0369A1; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 500; display: inline-block;">
                      ${sanitizeHTML(item.category)}
                    </span>
                  </td>
                  <td class="notes">${sanitizeHTML(item.notes || "-")}</td>
                  <td class="amount positive">$${formatCurrency(item.converted_amount || item.amount)}</td>
                  <td>
                    ${item.file_url ? `<a href="${item.file_url}" class="receipt-link" target="_blank" title="View Receipt">📄 View Receipt</a>` : '<span style="color: #9CA3AF;">No Receipt</span>'}
                    <div style="margin-top: 4px;">
                      ${item.policy_flag ? '<span class="policy-flag" title="Policy Violation">⚠️ Flag</span>' : '<span class="policy-ok" title="Policy Compliant">✓ OK</span>'}
                    </div>
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Category Totals -->
      <div class="category-section">
        <div class="section-title">📈 Category Breakdown</div>
        <div class="category-grid">
          <div>
            <table class="category-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${(summary?.totals_by_category || [])
                  .map(
                    (cat: CategoryTotal) => `
                  <tr>
                    <td><strong>${cat.category}</strong></td>
                    <td class="amount positive">$${formatCurrency(cat.amount)}</td>
                    <td class="notes">${getCategoryNotes(cat.category, cat.amount)}</td>
                  </tr>
                `,
                  )
                  .join("")}
                <tr class="grand-total">
                  <td><strong>Grand Total</strong></td>
                  <td class="amount">$${formatCurrency(summary?.total_reimbursable || 0)}</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div></div>
          <div class="currency-note">
            <em>All amounts in ${reportMeta.currency || "USD"}. ${reportMeta.locale ? `Converted using exchange rates as of ${formatDate(reportMeta.generated_at)}.` : ""}</em>
            ${policy?.notes ? `<br><br><strong>Policy Notes:</strong><br>${policy.notes.map((note: string) => `• ${note}`).join("<br>")}` : ""}
          </div>
        </div>
      </div>

      <!-- Sign-off Section -->
      <div class="signoff-section">
        <div class="certification-text">
          ${data.signoff?.submitter_signature_text || "I certify that these expenses are accurate and comply with company policy."}
        </div>
        <div class="signature-grid">
          <div class="signature-block">
            <div class="signature-title">Employee Signature</div>
            <div class="signature-line"></div>
            <div class="signature-label">Date</div>
          </div>
          <div class="signature-block">
            <div class="signature-title">Approver Signature</div>
            <div class="signature-line"></div>
            <div class="signature-label">Date</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-left">
          <span>ReimburseMe © ${new Date().getFullYear()}</span>
          <span>•</span>
          <a href="https://www.reimburseme.app" style="color: #2E86DE; text-decoration: none;">www.reimburseme.app</a>
          <span>•</span>
          <span>Generated automatically</span>
        </div>
        <div class="footer-right">Page 1 of ${totalPages}</div>
      </div>
    </div>

    ${showAppendix ? generateAppendixHTML(line_items, totalPages) : ""}
  </div>
</body>
</html>`;
}

function generateAppendixHTML(lineItems: LineItem[], totalPages: number): string {
  if (!lineItems || lineItems.length === 0) return "";

  return `
    <div class="page appendix-section">
      <div class="section-title">📎 Appendix: Receipt Images</div>
      <div class="receipt-gallery">
        ${lineItems
          .slice(0, 12)
          .map(
            (item: LineItem) => `
          <div class="receipt-thumbnail">
            <div class="thumbnail-placeholder">
              ${item.file_url ? `<a href="${item.file_url}" target="_blank" style="text-decoration: none; color: inherit;">🧾 Click to View</a>` : "📄 No Receipt"}
            </div>
            <div class="thumbnail-info">
              <div><strong>${item.merchant}</strong></div>
              <div>${formatDate(item.date)}</div>
              <div class="thumbnail-amount">$${formatCurrency(item.converted_amount || item.amount)}</div>
              ${item.file_url ? '<div style="font-size: 8px; color: #2E86DE; font-weight: 500; margin-top: 4px;">Click to view receipt</div>' : ""}
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
      
      <!-- Footer for appendix -->
      <div class="footer">
        <div class="footer-left">
          <span>ReimburseMe © ${new Date().getFullYear()}</span>
          <span>•</span>
          <span>Receipt Appendix</span>
        </div>
        <div class="footer-right">Page ${totalPages} of ${totalPages}</div>
      </div>
    </div>
  `;
}

function generateCompactTemplate(data: ExpenseReportData): string {
  // Simplified compact version
  return generateReimburseMeTemplate(data)
    .replace(/padding: 24px/g, "padding: 18px")
    .replace(/padding: 20px/g, "padding: 16px")
    .replace(/margin-bottom: 28px/g, "margin-bottom: 20px")
    .replace(/font-size: 11px/g, "font-size: 10px");
}

function generateExecutiveTemplate(data: ExpenseReportData): string {
  // Executive dark theme
  return generateReimburseMeTemplate(data)
    .replace(/#2E86DE/g, "#1F2937")
    .replace(/#10B981/g, "#059669")
    .replace(/background: #F9FAFB/g, "background: #F3F4F6");
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
}

function formatMonthYear(dateStr: string): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  } catch {
    return "Invalid Date";
  }
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getCategoryNotes(category: string, amount: number): string {
  const notes: Record<string, string> = {
    Travel: amount > 500 ? "Includes airfare + lodging" : "Transportation only",
    Meals: amount > 100 ? "Within daily cap" : "Standard meals",
    Supplies: "Office materials",
    Other: "Miscellaneous expenses",
  };
  return notes[category] || "Standard business expense";
}