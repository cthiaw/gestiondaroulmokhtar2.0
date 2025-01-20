import React from 'react';

interface SummaryProps {
  average: number;
  appreciation: string;
}

export function Summary({ average, appreciation }: SummaryProps) {
  return (
    <div className="border-2 border-black rounded-lg p-4 bg-gray-50 no-break">
      <div className="flex justify-between items-center mb-2">
        <p className="text-lg font-bold">Moyenne: {average.toFixed(2)}/20</p>
      </div>
      <p className="text-gray-700">
        <strong>Appréciation générale:</strong> {appreciation}
      </p>
    </div>
  );
}