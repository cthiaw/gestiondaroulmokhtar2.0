import React, { useState, useEffect } from 'react';
import { UserPlus, RefreshCw } from 'lucide-react';
import { StudentForm } from '../components/forms/StudentForm';
import { ReenrollForm } from '../components/forms/ReenrollForm';
import { Modal } from '../components/modals/Modal';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { useModal } from '../hooks/useModal';
import { fetchStudents, deleteStudent } from '../services/studentService';
import { useAuth } from '../contexts/AuthContext';
import { useSchoolYear } from '../contexts/SchoolYearContext';
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
  const [selectedLevels, setSelectedLevels] = useState<{ french?: string; arabic?: string }>({});
  const formModal = useModal();
  const deleteModal = useModal();
  const reenrollModal = useModal();
  const { user } = useAuth();
  const { selectedYear, isCurrentYear } = useSchoolYear();
  const yearId = selectedYear?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadStudents();
  }, [user, navigate, yearId]);

  async function loadStudents() {
    if (!yearId) return;
    try {
      setLoading(true);
      const data = await fetchStudents(yearId);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (student: Student, french: Student | null, arabic: Student | null) => {
    setSelectedStudent(student);
    setSelectedLevels({ french: french?.level, arabic: arabic?.level });
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
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Élèves</h1>
          <p className="mt-1 text-sm text-slate-500">
            {Object.keys(groupedStudents).length} élève(s) inscrit(s) en {selectedYear?.label}
          </p>
        </div>
        {isCurrentYear && (
          <div className="flex flex-wrap gap-2">
            <button onClick={reenrollModal.openModal} className="btn-secondary">
              <RefreshCw className="h-5 w-5" />
              Réinscrire des élèves
            </button>
            <button
              onClick={() => {
                setSelectedStudent(null);
                formModal.openModal();
              }}
              className="btn-primary"
            >
              <UserPlus className="h-5 w-5" />
              Nouvel Élève
            </button>
          </div>
        )}
      </div>

      <Table>
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Matricule</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prénom</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date de Naissance</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Genre</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Niveau Français</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Niveau Arabe</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
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
                    onClick={() => handleEdit(student, french, arabic)}
                    className="font-medium text-brand-700 hover:text-brand-900"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      deleteModal.openModal();
                    }}
                    className="font-medium text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            );
          })}
          {Object.keys(groupedStudents).length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                Aucun élève inscrit en {selectedYear?.label}.
                {isCurrentYear && ' Ajoutez un nouvel élève ou réinscrivez ceux de l\'année précédente.'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={selectedStudent ? 'Modifier un élève' : 'Ajouter un élève'}
      >
        <StudentForm
          key={selectedStudent?.id ?? 'new'}
          student={selectedStudent || undefined}
          frenchLevel={selectedLevels.french}
          arabicLevel={selectedLevels.arabic}
          onSuccess={handleFormSuccess}
          onCancel={formModal.closeModal}
        />
      </Modal>

      <Modal
        isOpen={reenrollModal.isOpen}
        onClose={reenrollModal.closeModal}
        title={`Réinscrire des élèves en ${selectedYear?.label}`}
        size="xl"
      >
        {selectedYear && (
          <ReenrollForm
            targetYear={selectedYear}
            onSuccess={async () => {
              await loadStudents();
              reenrollModal.closeModal();
            }}
            onCancel={reenrollModal.closeModal}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Supprimer l'élève"
        message="Êtes-vous sûr de vouloir supprimer cet élève ? Il n'apparaîtra plus dans les listes, mais ses paiements, notes et absences sont conservés pour l'audit."
      />
    </div>
  );
}