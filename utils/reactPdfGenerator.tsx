import { pdf } from '@react-pdf/renderer';
import { ReimburseMePDFDocument } from './reactPdfTemplates';
import { ExpenseReportData } from './reactPdfTemplates';

export interface GeneratePDFOptions {
  paperSize?: string;
  userId?: string;
}

export interface PDFResult {
  pdfBuffer: Buffer;
  pdf_url: string;
  pages: number;
  template_used: string;
  filename: string;
  html_content: string;
}

/**
 * Generate PDF using React-PDF renderer
 * This is a drop-in replacement for the Puppeteer-based generator
 * that works reliably on Vercel without headless browser requirements
 */
export async function generateReactPDF(
  data: ExpenseReportData,
  options?: { userId?: string }
): Promise<PDFResult> {
  try {
    // Step 1 & 2: Generate PDF Buffer directly from JSX
    const pdfBlob = await pdf(<ReimburseMePDFDocument data={data} />).toBlob();
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Step 3: Generate filename
    const userSlug = data.submitter.email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const dateStr = data.reportMeta.period_start || new Date().toISOString();
    const periodStart = new Date(dateStr);

    const periodStr = !isNaN(periodStart.getTime())
      ? `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`
      : 'report';

    const filename = `reimburseme_${userSlug}_${periodStr}.pdf`;

    // Step 4: Calculate estimated pages
    const estimatedPages = Math.max(
      1,
      Math.ceil((data.line_items?.length || 0) / 15) +
        1 +
        (data.appendix?.include_receipt_gallery ? 1 : 0)
    );

    // Step 5: Create data URL
    const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

    return {
      pdfBuffer,
      pdf_url: pdfDataUrl,
      pages: estimatedPages,
      template_used: data.branding?.template || 'Classic',
      filename,
      html_content: '', // Not applicable for React-PDF (we don't generate HTML)
    };
  } catch (error) {
    console.error('React-PDF Generation Error:', error);
    throw new Error(
      `Failed to generate PDF with React-PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
