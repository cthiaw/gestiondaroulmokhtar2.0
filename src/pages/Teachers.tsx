import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { TeacherForm } from '../components/forms/TeacherForm';
import { Modal } from '../components/modals/Modal';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { useModal } from '../hooks/useModal';
import { fetchTeachers, deleteTeacher, Teacher } from '../services/teacherService';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { STAFF_TYPES } from '../constants/staffTypes';
import { Table } from '../components/ui/Table';

export function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const formModal = useModal();
  const deleteModal = useModal();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadTeachers();
  }, [user, navigate]);

  async function loadTeachers() {
    setLoading(true);
    const { data, error } = await fetchTeachers();
    if (!error) {
      setTeachers(data);
    }
    setLoading(false);
  }

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    formModal.openModal();
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    const { error } = await deleteTeacher(selectedTeacher.id);
    if (!error) {
      await loadTeachers();
      deleteModal.closeModal();
      setSelectedTeacher(null);
    }
  };

  const handleFormSuccess = async () => {
    await loadTeachers();
    formModal.closeModal();
    setSelectedTeacher(null);
  };

  const getStaffTypeLabel = (value: string) => {
    return STAFF_TYPES.find(type => type.value === value)?.label || value;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Personnels</h1>
        <button
          onClick={() => {
            setSelectedTeacher(null);
            formModal.openModal();
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <UserPlus className="h-5 w-5" />
          Nouveau Personnel
        </button>
      </div>

      <Table>
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium">{teacher.matricule}</td>
              <td className="px-6 py-4 whitespace-nowrap">{teacher.last_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{teacher.first_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{getStaffTypeLabel(teacher.staff_type)}</td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <button
                  onClick={() => handleEdit(teacher)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    setSelectedTeacher(teacher);
                    deleteModal.openModal();
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={selectedTeacher ? 'Modifier un personnel' : 'Ajouter un personnel'}
      >
        <TeacherForm
          teacher={selectedTeacher || undefined}
          onSuccess={handleFormSuccess}
          onCancel={formModal.closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Supprimer le personnel"
        message="Êtes-vous sûr de vouloir supprimer ce personnel ? Cette action est irréversible."
      />
    </div>
  );
}