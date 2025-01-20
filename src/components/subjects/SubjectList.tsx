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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subjects.map((subject) => (
            <tr key={subject.id}>
              <td className="px-6 py-4 whitespace-nowrap">{subject.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getClassTypeLabel(subject.class_type)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <button
                  onClick={() => onEdit(subject)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(subject)}
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
  );
}