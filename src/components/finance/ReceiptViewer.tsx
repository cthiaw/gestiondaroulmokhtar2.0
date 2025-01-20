import React from 'react';
import { Download, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { Payment } from '../../types/finance';
import { createReceiptTemplate, generateReceiptHTML } from '../../utils/receiptGenerator';

interface ReceiptViewerProps {
  payment: Payment;
  onClose: () => void;
}

export function ReceiptViewer({ payment, onClose }: ReceiptViewerProps) {
  const template = createReceiptTemplate(payment);
  const html = generateReceiptHTML(template);

  const handleDownload = () => {
    const element = document.getElementById('receipt-content');
    if (!element) return;

    const options = {
      filename: `recu_${template.receiptNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-[210mm] my-8">
          {/* Download and Close buttons */}
          <div className="absolute right-4 top-4 flex space-x-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2 hover:bg-indigo-700"
            >
              <Download className="h-5 w-5" />
              Télécharger PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Receipt Content */}
          <div id="receipt-content" className="p-8">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}