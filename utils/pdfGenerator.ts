import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium-min";
import { generateHTML, ExpenseReportData } from "./htmlTemplates";

// Remote Chromium executable path for Vercel serverless environment
const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar";

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

// Enhanced PDF generation using Puppeteer for HTML to PDF conversion
export async function generatePDF(
  data: ExpenseReportData,
  options?: { userId?: string }
): Promise<PDFResult> {
  let browser;
  try {
    // Generate HTML content
    const htmlContent = generateHTML(data);

    // Generate filename
    const userSlug = data.submitter.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const periodStart = new Date(data.reportMeta.period_start);
    const periodStr = `${periodStart.getFullYear()}-${String(
      periodStart.getMonth() + 1
    ).padStart(2, "0")}`;
    const filename = `reimburseme_${userSlug}_${periodStr}.pdf`;

    // Check if running on Vercel (serverless environment)
    // Check multiple Vercel environment variables for compatibility
    const isVercel =
      process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === "production" ||
      process.env.VERCEL === "1" ||
      process.env.VERCEL_ENV !== undefined;
    
    if (isVercel) {
      console.log("Using serverless Chromium for PDF generation (Vercel environment)");
      // Launch Puppeteer with serverless chromium for Vercel
      // Use remote executable path to download Chromium at runtime
      browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(remoteExecutablePath),
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      });
    } else {
      console.log("Using local Chrome/Chromium for PDF generation (development)");
      // Launch Puppeteer with local Chrome for development
      browser = await puppeteer.launch({
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          ...(process.platform !== "win32" ? ["--single-process"] : []),
        ],
        headless: true,
      });
    }

    const page = await browser.newPage();

    // Set viewport for better PDF rendering (only if not using chromium default)
    if (!isVercel) {
      await page.setViewport({ width: 1200, height: 800 });
    }

    // Set HTML content with increased timeout for reliability
    await page.setContent(htmlContent, {
      waitUntil: "load",
      timeout: 30000,
    });

    // Emulate print media for better PDF rendering
    await page.emulateMediaType("print");

    // Generate PDF with print-friendly options and timeout
    const pdfUint8Array = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      timeout: 30000,
    });

    // Convert to Buffer
    const pdfBuffer = Buffer.from(pdfUint8Array);

    // Calculate estimated pages based on content
    const estimatedPages = Math.max(
      1,
      Math.ceil((data.line_items?.length || 0) / 15) +
        1 +
        (data.appendix?.include_receipt_gallery ? 1 : 0)
    );

    // Create data URL for the PDF
    const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString(
      "base64"
    )}`;

    return {
      pdfBuffer,
      pdf_url: pdfDataUrl,
      pages: estimatedPages,
      template_used: data.branding?.template || "Classic",
      filename,
      html_content: htmlContent,
    };
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error(
      `Failed to generate PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
