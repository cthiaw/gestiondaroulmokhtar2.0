import React from 'react';
import { Subject } from '../../services/subject';
import { CLASS_TYPES } from '../../constants/classTypes';

interface SubjectListProps {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export function SubjectList({ subjects, onEdit, onDelete }: SubjectListProps) {
  const getClassTypeLabel = (value: string) => {
    return CLASS_TYPES.find(type => type.value === value)?.label || value;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {subjects.map((subject) => (
            <tr key={subject.id}>
              <td className="px-6 py-4 whitespace-nowrap">{subject.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getClassTypeLabel(subject.class_type)}
              </td>
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
        </tbody>
      </table>
    </div>
  );
}