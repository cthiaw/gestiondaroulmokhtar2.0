import React from 'react';
import { Grade } from '../../services/grade/types';
import { getGradeAppreciation } from '../../services/grade/appreciation';

interface GradesListProps {
  grades: Grade[];
  onDelete: (grade: Grade) => void;
}

export function GradesList({ grades, onDelete }: GradesListProps) {
  if (grades.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-black">
        <p className="text-gray-500">Aucune note enregistrée pour ce trimestre</p>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden rounded-lg border-2 border-black">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-black">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-r-2 border-black">Matières</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-r-2 border-black">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-r-2 border-black">Appréciations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap border-b-2 border-black">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td className="px-6 py-4 whitespace-nowrap border-r-2 border-black">
                  {grade.subject?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium border-r-2 border-black">
                  {grade.score.toFixed(2)}/{grade.max_score}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r-2 border-black">
                  {getGradeAppreciation(grade.score, grade.max_score)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onDelete(grade)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}