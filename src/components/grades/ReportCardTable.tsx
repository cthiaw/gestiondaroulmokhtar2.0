import React from 'react';
import { getAppreciation } from '../../utils/gradeUtils';

interface Grade {
  subject_name: string;
  coefficient: number;
  score: number;
  weighted_score: number;
}

interface ReportCardTableProps {
  grades: Grade[];
}

export function ReportCardTable({ grades }: ReportCardTableProps) {
  return (
    <div className="mb-6 overflow-hidden border-2 border-black rounded-lg no-break">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase border-b-2 border-r-2 border-black w-1/3">Matière</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase border-b-2 border-r-2 border-black w-[10%]">Coef.</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase border-b-2 border-r-2 border-black w-[15%]">Note/20</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase border-b-2 border-r-2 border-black w-1/4">Appréciation</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase border-b-2 border-black w-[15%]">Note × Coef.</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade, index) => (
            <tr key={index}>
              <td className="px-4 py-3 border-r-2 border-b-2 border-black font-medium">{grade.subject_name}</td>
              <td className="px-4 py-3 text-center border-r-2 border-b-2 border-black">{grade.coefficient}</td>
              <td className="px-4 py-3 text-center border-r-2 border-b-2 border-black font-medium">{grade.score.toFixed(2)}</td>
              <td className="px-4 py-3 border-r-2 border-b-2 border-black">{getAppreciation(grade.score)}</td>
              <td className="px-4 py-3 text-center border-b-2 border-black font-medium">{grade.weighted_score.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}