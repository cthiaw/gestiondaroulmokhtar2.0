import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { StudentForm } from '../components/forms/StudentForm';
import { Modal } from '../components/modals/Modal';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { useModal } from '../hooks/useModal';
import { fetchStudents, deleteStudent } from '../services/studentService';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { CLASS_LEVELS } from '../constants/classLevels';
import { Table } from '../components/ui/Table';
import { formatDate } from '../utils/dateUtils';
import type { Student } from '../types/student';

interface GroupedStudents {
  [key: string]: {
    french: Student | null;
    arabic: Student | null;
  };
}

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const formModal = useModal();
  const deleteModal = useModal();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadStudents();
  }, [user, navigate]);

  async function loadStudents() {
    try {
      setLoading(true);
      const data = await fetchStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    formModal.openModal();
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    const { error } = await deleteStudent(selectedStudent.id);
    if (!error) {
      await loadStudents();
      deleteModal.closeModal();
      setSelectedStudent(null);
    }
  };

  const handleFormSuccess = async () => {
    await loadStudents();
    formModal.closeModal();
    setSelectedStudent(null);
  };

  const getLevelLabel = (value: string) => {
    return CLASS_LEVELS.find(level => level.value === value)?.label || value;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const groupedStudents = students.reduce<GroupedStudents>((acc, student) => {
    const baseMatricule = student.matricule.replace('-AR', '');
    if (!acc[baseMatricule]) {
      acc[baseMatricule] = { french: null, arabic: null };
    }
    if (student.matricule.endsWith('-AR')) {
      acc[baseMatricule].arabic = student;
    } else {
      acc[baseMatricule].french = student;
    }
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Élèves</h1>
        <button
          onClick={() => {
            setSelectedStudent(null);
            formModal.openModal();
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <UserPlus className="h-5 w-5" />
          Nouvel Élève
        </button>
      </div>

      <Table>
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de Naissance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau Français</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau Arabe</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(groupedStudents).map(([baseMatricule, { french, arabic }]) => {
            const student = french || arabic;
            if (!student) return null;

            return (
              <tr key={baseMatricule}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{baseMatricule}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.first_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(student.birth_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.gender === 'M' ? 'Masculin' : 'Féminin'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {french ? getLevelLabel(french.level) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {arabic ? getLevelLabel(arabic.level) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEdit(student)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      deleteModal.openModal();
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={selectedStudent ? 'Modifier un élève' : 'Ajouter un élève'}
      >
        <StudentForm
          student={selectedStudent || undefined}
          onSuccess={handleFormSuccess}
          onCancel={formModal.closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Supprimer l'élève"
        message="Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible."
      />
    </div>
  );
}