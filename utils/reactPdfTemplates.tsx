import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

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

// Clean, professional styles - optimized for space efficiency
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1a1a1a',
  },
  
  // Header - compact and clean
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2px solid #2563eb',
  },
  
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  companySection: {
    flex: 1,
  },
  
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  reportTitle: {
    fontSize: 11,
    color: '#4b5563',
    marginBottom: 2,
  },
  
  metaSection: {
    alignItems: 'flex-end',
  },
  
  metaText: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  
  // Info section - compact grid
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 20,
  },
  
  infoBlock: {
    flex: 1,
  },
  
  infoLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  
  infoText: {
    fontSize: 9,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  
  // Summary - single row
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 10,
    marginBottom: 15,
    gap: 15,
    borderRadius: 4,
  },
  
  summaryItem: {
    flex: 1,
  },
  
  summaryLabel: {
    fontSize: 7,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  
  // Table - compact and clean
  table: {
    marginBottom: 15,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    padding: '8 6',
  },
  
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  tableRow: {
    flexDirection: 'row',
    padding: '6 6',
    borderBottom: '1px solid #e5e7eb',
  },
  
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  
  tableCell: {
    fontSize: 8,
    color: '#1a1a1a',
  },
  
  // Column widths
  colDate: { width: '12%' },
  colMerchant: { width: '25%' },
  colCategory: { width: '15%' },
  colNotes: { width: '28%' },
  colAmount: { width: '20%', textAlign: 'right' },
  
  categoryBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '2 6',
    borderRadius: 3,
    fontSize: 7,
  },
  
  amountText: {
    fontWeight: 'bold',
    color: '#059669',
  },
  
  // Category totals - compact table
  categorySection: {
    marginTop: 15,
    marginBottom: 20,
  },
  
  categoryTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  
  categoryGrid: {
    flexDirection: 'row',
    gap: 30,
  },
  
  categoryTableWrap: {
    flex: 1,
  },
  
  categoryRow: {
    flexDirection: 'row',
    padding: '4 0',
    borderBottom: '1px solid #e5e7eb',
  },
  
  categoryRowHeader: {
    borderBottom: '2px solid #1f2937',
    marginBottom: 4,
  },
  
  categoryName: {
    flex: 1,
    fontSize: 8,
  },
  
  categoryAmount: {
    width: '30%',
    textAlign: 'right',
    fontSize: 8,
    fontWeight: 'bold',
  },
  
  totalRow: {
    borderTop: '2px solid #1f2937',
    paddingTop: 6,
    marginTop: 4,
  },
  
  totalText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    paddingTop: 8,
    borderTop: '1px solid #e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#9ca3af',
  },
});

// Utility functions
function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Main PDF component - clean and efficient
export const ReimburseMePDFDocument: React.FC<{ data: ExpenseReportData }> = ({ data }) => {
  const {
    reportMeta,
    submitter,
    recipient,
    summary,
    line_items = [],
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.companySection}>
              <Text style={styles.companyName}>{recipient.company_name}</Text>
              <Text style={styles.reportTitle}>Expense Reimbursement Report</Text>
            </View>
            <View style={styles.metaSection}>
              <Text style={styles.metaText}>Report ID: {reportMeta.report_id}</Text>
              <Text style={styles.metaText}>Period: {formatDate(reportMeta.period_start)} - {formatDate(reportMeta.period_end)}</Text>
              <Text style={styles.metaText}>Generated: {formatDate(reportMeta.generated_at)}</Text>
            </View>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Submitted By</Text>
            <Text style={styles.infoText}>{submitter.name}</Text>
            <Text style={styles.infoText}>{submitter.email}</Text>
            {submitter.department && (
              <Text style={styles.infoText}>{submitter.department}</Text>
            )}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Approver</Text>
            <Text style={styles.infoText}>{recipient.approver_name}</Text>
            <Text style={styles.infoText}>{recipient.approver_email}</Text>
          </View>
        </View>

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>${formatCurrency(summary?.total_reimbursable || 0)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>{line_items.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Currency</Text>
            <Text style={styles.summaryValue}>{reportMeta.currency || 'USD'}</Text>
          </View>
        </View>

        {/* Expense Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderCell, styles.colMerchant]}>Merchant</Text>
            <Text style={[styles.tableHeaderCell, styles.colCategory]}>Category</Text>
            <Text style={[styles.tableHeaderCell, styles.colNotes]}>Notes</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>

          {line_items.map((item, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableCell, styles.colDate]}>
                {formatDate(item.date)}
              </Text>
              <Text style={[styles.tableCell, styles.colMerchant]}>
                {item.merchant}
              </Text>
              <View style={styles.colCategory}>
                <Text style={styles.categoryBadge}>{item.category}</Text>
              </View>
              <Text style={[styles.tableCell, styles.colNotes]}>
                {item.notes || '-'}
              </Text>
              <Text style={[styles.tableCell, styles.colAmount, styles.amountText]}>
                ${formatCurrency(item.converted_amount || item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Category Breakdown */}
        {summary?.totals_by_category && summary.totals_by_category.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Category Summary</Text>
            <View style={styles.categoryGrid}>
              <View style={styles.categoryTableWrap}>
                {summary.totals_by_category.map((cat, idx) => (
                  <View key={idx} style={styles.categoryRow}>
                    <Text style={styles.categoryName}>{cat.category}</Text>
                    <Text style={styles.categoryAmount}>${formatCurrency(cat.amount)}</Text>
                  </View>
                ))}
                <View style={[styles.categoryRow, styles.totalRow]}>
                  <Text style={[styles.categoryName, styles.totalText]}>Total</Text>
                  <Text style={[styles.categoryAmount, styles.totalText]}>
                    ${formatCurrency(summary.total_reimbursable)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>ReimburseMe © {new Date().getFullYear()}</Text>
          <Text>Page 1</Text>
        </View>
      </Page>
    </Document>
  );
};
