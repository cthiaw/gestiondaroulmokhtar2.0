import { supabase } from '../lib/supabase';
import { Payment } from '../types/finance';
import { ReceiptData } from '../types/receipt';
import { createReceiptTemplate, generateReceiptHTML } from '../utils/receiptGenerator';

export async function generateAndSaveReceipt(payment: Payment): Promise<ReceiptData | null> {
  try {
    // Generate receipt content
    const template = createReceiptTemplate(payment);
    const htmlContent = generateReceiptHTML(template);
    
    // Convert HTML to Blob
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const file = new File([blob], `receipt-${template.receiptNumber}.html`, { type: 'text/html' });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(`${payment.id}/${file.name}`, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(uploadData.path);

    // Save receipt record
    const { data: receiptData, error: insertError } = await supabase
      .from('receipts')
      .insert([{
        payment_id: payment.id,
        receipt_number: template.receiptNumber,
        file_url: publicUrl,
        generated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    return receiptData;
  } catch (error) {
    console.error('Error generating receipt:', error);
    return null;
  }
}

export async function getPaymentReceipt(paymentId: string): Promise<ReceiptData | null> {
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return null;
  }
}