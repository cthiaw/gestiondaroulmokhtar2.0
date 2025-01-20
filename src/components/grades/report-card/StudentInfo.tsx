import React from 'react';
import { formatDate } from '../../../utils/dateUtils';
import { CLASS_LEVELS } from '../../../constants/classLevels';
import { CLASS_TYPES } from '../../../constants/classTypes';

interface StudentInfoProps {
  student: {
    matricule: string;
    first_name: string;
    last_name: string;
    level: string;
    class_type: string;
    birth_date: string;
  };
  absences: number;
}

export function StudentInfo({ student, absences }: StudentInfoProps) {
  const getLevelLabel = (value: string) => {
    return CLASS_LEVELS.find(level => level.value === value)?.label || value;
  };

  const getClassTypeLabel = (value: string) => {
    return CLASS_TYPES.find(type => type.value === value)?.label || value;
  };

  return (
    <div className="mb-6 border-2 border-black rounded-lg p-4 bg-gray-50 no-break">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Élève:</strong> {student.first_name} {student.last_name}</p>
          <p><strong>Matricule:</strong> {student.matricule}</p>
          <p><strong>Niveau:</strong> {getLevelLabel(student.level)}</p>
        </div>
        <div>
          <p><strong>Date de naissance:</strong> {formatDate(student.birth_date)}</p>
          <p><strong>Type de classe:</strong> {getClassTypeLabel(student.class_type)}</p>
          <p><strong>Nombre d'absences:</strong> {absences}</p>
        </div>
      </div>
    </div>
  );
}