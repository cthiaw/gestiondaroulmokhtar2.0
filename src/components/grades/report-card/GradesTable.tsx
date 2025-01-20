import React from 'react';

interface Grade {
  subject_name: string;
  score: number;
}

interface GradesTableProps {
  grades: Grade[];
}

export function GradesTable({ grades }: GradesTableProps) {
  return (
    <div className="mb-6 overflow-hidden border-2 border-black rounded-lg no-break">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase border-b-2 border-r-2 border-black w-1/2">Matières</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase border-b-2 border-r-2 border-black w-[15%]">Notes</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase border-b-2 border-black w-1/3">Appréciations</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade, index) => (
            <tr key={index}>
              <td className="px-4 py-3 border-r-2 border-b-2 border-black">{grade.subject_name}</td>
              <td className="px-4 py-3 text-center border-r-2 border-b-2 border-black">{grade.score.toFixed(2)}</td>
              <td className="px-4 py-3 border-b-2 border-black">{getAppreciation(grade.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getAppreciation(score: number): string {
  if (score >= 18) return "Excellent";
  if (score >= 16) return "Très Bien";
  if (score >= 14) return "Bien";
  if (score >= 12) return "Assez Bien";
  if (score >= 10) return "Passable";
  return "Insuffisant";
}