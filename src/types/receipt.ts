export interface ReceiptData {
  id: string;
  payment_id: string;
  receipt_number: string;
  generated_at: string;
  file_url: string;
}

export interface ReceiptTemplate {
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  receiptNumber: string;
  date: string;
  studentName: string;
  studentMatricule: string;
  amount: number;
  paymentType: string;
  status: string;
}