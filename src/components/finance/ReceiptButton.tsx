import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Payment } from '../../types/finance';
import { generateAndSaveReceipt, getPaymentReceipt } from '../../services/receiptService';

interface ReceiptButtonProps {
  payment: Payment;
}

export function ReceiptButton({ payment }: ReceiptButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      
      // Check if receipt already exists
      const existingReceipt = await getPaymentReceipt(payment.id);
      
      if (existingReceipt) {
        // Open existing receipt in new window
        window.open(existingReceipt.file_url, '_blank');
      } else {
        // Generate new receipt
        const receipt = await generateAndSaveReceipt(payment);
        if (receipt) {
          window.open(receipt.file_url, '_blank');
        }
      }
    } catch (error) {
      console.error('Error handling receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
      title="Générer reçu"
    >
      <FileText className="h-5 w-5" />
    </button>
  );
}