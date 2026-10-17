import { getGradeAppreciation } from '../../../services/grade/appreciation';

interface Grade {
  subject_name: string;
  score: number;
  maxScore: number;
}

interface GradesTableProps {
  grades: Grade[];
  totalScore: number;
  totalMaxScore: number;
}

// 12.5 → "12,5" and 12 → "12"
function formatPoints(value: number): string {
  return Number(value.toFixed(2)).toLocaleString('fr-FR');
}

export function GradesTable({ grades, totalScore, totalMaxScore }: GradesTableProps) {
  return (
    <div className="mb-6 overflow-hidden border-2 border-black rounded-lg no-break">
      <table className="min-w-full">
        <thead className="bg-slate-50">
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
              <td className="px-4 py-3 text-center border-r-2 border-b-2 border-black whitespace-nowrap">
                {formatPoints(grade.score)} / {grade.maxScore}
              </td>
              <td className="px-4 py-3 border-b-2 border-black">{getGradeAppreciation(grade.score, grade.maxScore)}</td>
            </tr>
          ))}
          <tr className="bg-slate-50 font-bold">
            <td className="px-4 py-3 border-r-2 border-black">Total</td>
            <td className="px-4 py-3 text-center border-r-2 border-black whitespace-nowrap">
              {formatPoints(totalScore)} / {totalMaxScore}
            </td>
            <td className="px-4 py-3"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
