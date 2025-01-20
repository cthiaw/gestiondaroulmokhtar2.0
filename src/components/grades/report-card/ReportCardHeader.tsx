import React from 'react';

interface ReportCardHeaderProps {
  trimester: number;
  year: number;
}

export function ReportCardHeader({ trimester, year }: ReportCardHeaderProps) {
  return (
    <div className="text-center mb-8 border-b-2 border-black pb-4 no-break">
      <h1 className="text-2xl font-bold">DAROUL MOKHTAR FRANCO ARABE</h1>
      <p>Quartier Sante Yalla, Pout, THIES</p>
      <p>Tel : 77 282 00 36 | Email : daroulmokhtar1@gmail.com</p>
      <h2 className="text-xl font-bold mt-4">Bulletin de Notes</h2>
      <p className="text-gray-600">Trimestre {trimester} - {year}</p>
    </div>
  );
}