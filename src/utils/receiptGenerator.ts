import { Payment } from '../types/finance';
import { ReceiptTemplate } from '../types/receipt';
import { PAYMENT_TYPES } from '../constants/financeTypes';
import { PAYMENT_STATUS } from '../constants/paymentStatus';

export function generateReceiptNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `RECU-${timestamp}-${random}`;
}

export function formatReceiptDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function createReceiptTemplate(payment: Payment): ReceiptTemplate {
  return {
    schoolName: "DAROUL MOKHTAR FRANCO ARABE",
    schoolAddress: "Quartier Sante Yalla, Pout, THIES",
    schoolPhone: "Tel : 77 282 00 36 / 77 155 35 68",
    receiptNumber: generateReceiptNumber(),
    date: formatReceiptDate(payment.payment_date),
    studentName: `${payment.student?.first_name} ${payment.student?.last_name}`,
    studentMatricule: payment.student?.matricule || '',
    amount: payment.amount,
    paymentType: PAYMENT_TYPES.find(t => t.value === payment.payment_type)?.label || payment.payment_type,
    status: PAYMENT_STATUS.find(s => s.value === payment.status)?.label || payment.status
  };
}

export function generateReceiptHTML(template: ReceiptTemplate): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reçu de Paiement - ${template.receiptNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .receipt {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ccc;
          padding: 20px;
          background: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          color: #000;
          font-size: 24px;
          font-weight: bold;
        }
        .school-info {
          margin-bottom: 20px;
          font-size: 14px;
        }
        .receipt-details {
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
        }
        .student-info {
          margin-bottom: 30px;
          padding: 15px;
          background: #f8f8f8;
          border-radius: 4px;
        }
        .payment-info {
          border-top: 1px solid #ccc;
          padding-top: 20px;
        }
        .amount {
          font-size: 24px;
          font-weight: bold;
          color: #000;
          margin: 20px 0;
          text-align: right;
          padding: 10px;
          background: #f0f0f0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 100px;
          opacity: 0.1;
          pointer-events: none;
          z-index: -1;
        }

        @media print {
          body {
            padding: 0;
            background: #fff;
          }
          .receipt {
            border: none;
            padding: 0;
            max-width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
          @page {
            margin: 2cm;
            size: A4;
          }
        }

        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 20px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .print-button:hover {
          background: #4338ca;
        }
        @media print {
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button onclick="window.print()" class="print-button no-print">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9V2h12v7"></path>
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"></path>
          <path d="M6 14h12v8H6z"></path>
        </svg>
        Imprimer
      </button>

      <div class="receipt">
        <div class="watermark">REÇU</div>
        
        <div class="header">
          <h1>${template.schoolName}</h1>
          <div class="school-info">
            <p>${template.schoolAddress}</p>
            <p>${template.schoolPhone}</p>
          </div>
        </div>
        
        <div class="receipt-details">
          <div>
            <p><strong>N° Reçu:</strong> ${template.receiptNumber}</p>
            <p><strong>Date:</strong> ${template.date}</p>
          </div>
          <div>
            <p><strong>Statut:</strong> ${template.status}</p>
          </div>
        </div>
        
        <div class="student-info">
          <p><strong>Élève:</strong> ${template.studentName}</p>
          <p><strong>Matricule:</strong> ${template.studentMatricule}</p>
        </div>
        
        <div class="payment-info">
          <p><strong>Type de paiement:</strong> ${template.paymentType}</p>
          <div class="amount">
            Montant: ${template.amount.toLocaleString()} FCFA
          </div>
        </div>

        <div class="footer">
          <p>Ce reçu est généré électroniquement et est valide sans signature.</p>
          <p>Date d'émission: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}