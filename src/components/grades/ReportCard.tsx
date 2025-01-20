import React from 'react';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { ReportCardData } from '../../types/grades';
import { ReportCardHeader } from './report-card/ReportCardHeader';
import { StudentInfo } from './report-card/StudentInfo';
import { GradesTable } from './report-card/GradesTable';
import { Summary } from './report-card/Summary';
import { getGeneralAppreciation } from '../../utils/gradeUtils';

interface ReportCardProps {
  data: ReportCardData;
  onClose: () => void;
}

export function ReportCard({ data, onClose }: ReportCardProps) {
  const handleDownload = () => {
    const element = document.getElementById('report-card-content');
    if (!element) return;

    const options = {
      filename: `bulletin_${data.student.matricule}_trimestre${data.trimester}.pdf`,
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
          <div className="absolute right-4 top-4 flex space-x-2 print:hidden">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2 hover:bg-indigo-700"
            >
              <Download className="h-5 w-5" />
              Télécharger PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>

          {/* Report Card Content */}
          <div id="report-card-content" className="p-[15mm] report-card">
            <ReportCardHeader 
              trimester={data.trimester} 
              year={new Date().getFullYear()} 
            />

            <StudentInfo 
              student={data.student}
              absences={data.absences}
            />

            <GradesTable grades={data.grades} />

            <Summary
              average={data.average}
              appreciation={getGeneralAppreciation(data.average)}
            />

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500 print:mt-16 no-break">
              <p>Document généré le {new Date().toLocaleDateString('fr-FR')}</p>
              <p>Ce bulletin est un document officiel de l'école</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}