import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { generateHTML, ExpenseReportData } from "./htmlTemplates";

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
 * Get Chromium executable path with fallback for local development
 * On Vercel: Uses @sparticuz/chromium
 * Local dev: Falls back to system Chrome/Chromium if available
 */
async function getChromiumExecutablePath(): Promise<string | undefined> {
  // Try to get serverless Chromium path (works on Vercel)
  // Wrap in try-catch as executablePath() might throw in some environments
  try {
    const chromiumPath = await chromium.executablePath();
    
    if (chromiumPath && typeof chromiumPath === "string" && chromiumPath.length > 0) {
      return chromiumPath;
    }
  } catch (error) {
    // executablePath() might throw in some environments, continue to fallback
    console.warn("Failed to get serverless Chromium path, trying fallback:", error);
  }

  // Fallback for local development - try common Chrome/Chromium paths
  // This allows local testing without requiring full Puppeteer installation
  const possiblePaths = [
    process.env.CHROMIUM_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    // Windows paths
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    // macOS paths
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    // Linux paths
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean) as string[];

  for (const path of possiblePaths) {
    try {
      const fs = await import("fs/promises");
      await fs.access(path);
      return path;
    } catch {
      // Path doesn't exist, try next
      continue;
    }
  }

  // If no path found, return undefined - will use default Puppeteer behavior
  // This will fail gracefully with a clear error message
  return undefined;
}

// Enhanced PDF generation using Puppeteer for HTML to PDF conversion
// Optimized for Vercel serverless environment with local development fallback
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

    // Get Chromium executable path (with fallback for local dev)
    const executablePath = await getChromiumExecutablePath();

    if (!executablePath) {
      throw new Error(
        "Chromium executable not found. " +
        "On Vercel: Ensure @sparticuz/chromium is installed. " +
        "Local dev: Install Chrome/Chromium or set CHROMIUM_PATH environment variable."
      );
    }

    // Check if we're using serverless Chromium from @sparticuz/chromium
    // The serverless Chromium path is typically in /tmp or /var/task
    // More specific checks to avoid false positives with local Chrome paths
    const isServerlessChromium = 
      process.env.VERCEL === "1" ||
      process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
      executablePath.includes("/tmp/") || 
      executablePath.includes("/var/task/") ||
      executablePath.includes("/var/runtime/") ||
      (executablePath.includes("chromium") && 
       !executablePath.includes("Chrome") && 
       !executablePath.includes("chrome.exe"));

    // Configure launch options for Vercel serverless environment
    const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
      executablePath,
      headless: true,
      args: isServerlessChromium 
        ? chromium.args 
        : [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-web-security",
          ],
    };

    // Only set defaultViewport if using serverless Chromium
    if (isServerlessChromium && chromium.defaultViewport) {
      launchOptions.defaultViewport = chromium.defaultViewport;
    }

    // Launch Puppeteer with appropriate configuration
    browser = await puppeteer.launch(launchOptions);

    let page;
    try {
      page = await browser.newPage();

      // Set viewport for better PDF rendering (override default if needed)
      await page.setViewport({ width: 1200, height: 800 });

      // Set HTML content with timeout optimized for Vercel
      // Vercel Hobby: 10s limit, Pro: 60s limit
      // Using 25s to leave buffer for PDF generation
      // Using "load" instead of "networkidle0" for faster rendering
      await page.setContent(htmlContent, {
        waitUntil: "load", // Faster than networkidle0, sufficient for static HTML
        timeout: 25000,
      });

      // Emulate print media for better PDF rendering
      await page.emulateMediaType("print");

      // Generate PDF with print-friendly options and timeout
      // Reduced timeout to work within Vercel's limits
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
      timeout: 25000, // Reduced for Vercel compatibility
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
    } finally {
      // Ensure page is closed even if PDF generation fails
      if (page) {
        try {
          await page.close();
        } catch (pageError) {
          console.warn("Failed to close page:", pageError);
        }
      }
    }
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
