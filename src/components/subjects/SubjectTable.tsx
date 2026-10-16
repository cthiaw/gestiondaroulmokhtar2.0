import React from 'react';
import { Subject } from '../../services/subject';

interface SubjectTableProps {
  title: string;
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export function SubjectTable({ title, subjects, onEdit, onDelete }: SubjectTableProps) {
  return (
    <div className="card overflow-hidden">
      <h3 className="border-b border-slate-200 px-6 py-4 text-base font-semibold text-slate-900">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td className="px-6 py-4 whitespace-nowrap">{subject.name}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => onEdit(subject)}
                    className="font-medium text-brand-700 hover:text-brand-900"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(subject)}
                    className="font-medium text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  Aucune matière
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}