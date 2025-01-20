import React, { useState, useEffect } from 'react';
import { BookText } from 'lucide-react';
import { SubjectForm } from '../components/forms/SubjectForm';
import { Modal } from '../components/modals/Modal';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { useModal } from '../hooks/useModal';
import { fetchSubjects, deleteSubject } from '../services/subjectService';
import { Subject } from '../types/grades';
import { CLASS_TYPES } from '../constants/classTypes';

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const formModal = useModal();
  const deleteModal = useModal();

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    setLoading(true);
    const { data } = await fetchSubjects('');
    setSubjects(data);
    setLoading(false);
  }

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    formModal.openModal();
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;
    await deleteSubject(selectedSubject.id);
    await loadSubjects();
    deleteModal.closeModal();
    setSelectedSubject(null);
  };

  const handleFormSuccess = async () => {
    await loadSubjects();
    formModal.closeModal();
    setSelectedSubject(null);
  };

  const getClassTypeLabel = (value: string) => {
    return CLASS_TYPES.find(type => type.value === value)?.label || value;
  };

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Matières</h1>
        <button
          onClick={() => {
            setSelectedSubject(null);
            formModal.openModal();
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <BookText className="h-5 w-5" />
          Nouvelle Matière
        </button>
      </div>

      <div className="table-wrapper">
        <div className="table-scroll">
          <div className="table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coefficient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de Classe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.coefficient}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getClassTypeLabel(subject.class_type)}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubject(subject);
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
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={selectedSubject ? 'Modifier une matière' : 'Ajouter une matière'}
      >
        <SubjectForm
          subject={selectedSubject}
          onSuccess={handleFormSuccess}
          onCancel={formModal.closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Supprimer la matière"
        message="Êtes-vous sûr de vouloir supprimer cette matière ? Cette action est irréversible."
      />
    </div>
  );
}