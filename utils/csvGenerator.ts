export interface Receipt {
  id: string;
  merchant_name: string;
  amount: string;
  category: string;
  receipt_date: string;
  currency: string;
  user_name: string;
  user_email?: string;
  note?: string;
  status?: string;
}

export function generateCSV(receipts: Receipt[], teamId: string): string {
  // Define CSV headers
  const headers = [
    'Date',
    'Merchant',
    'Category',
    'Submitted By',
    'Email',
    'Amount',
    'Currency',
    'Notes',
    'Status'
  ];

  // Helper to escape CSV fields
  const escapeCsv = (str: string | undefined): string => {
    if (!str) return '';
    const output = str.replace(/"/g, '""'); // Escape double quotes
    if (output.includes(',') || output.includes('"') || output.includes('\n')) {
      return `"${output}"`;
    }
    return output;
  };

  // Generate CSV rows
  const rows = receipts.map((receipt) => {
    return [
      escapeCsv(receipt.receipt_date),
      escapeCsv(receipt.merchant_name),
      escapeCsv(receipt.category),
      escapeCsv(receipt.user_name),
      escapeCsv(receipt.user_email),
      escapeCsv(receipt.amount),
      escapeCsv(receipt.currency),
      escapeCsv(receipt.note || ''),
      escapeCsv(receipt.status || 'Completed')
    ].join(',');
  });

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
