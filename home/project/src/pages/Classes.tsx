import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FolderPlus } from 'lucide-react';
import { ClassForm } from '../components/forms/ClassForm';
import { Modal } from '../components/modals/Modal';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { useModal } from '../hooks/useModal';
import { CLASS_TYPES } from '../constants/classTypes';
import { CLASS_NAMES } from '../constants/classNames';

interface Class {
  id: string;
  name: string;
  level: string;
  class_type: string;
  teacher_id: string;
  teacher_name?: string;
}

export function Classes() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const formModal = useModal();
  const deleteModal = useModal();

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teachers (
            first_name,
            last_name
          )
        `)
        .order('level');

      if (error) throw error;
      
      const formattedClasses = data?.map(classItem => ({
        ...classItem,
        teacher_name: classItem.teachers 
          ? `${classItem.teachers.first_name} ${classItem.teachers.last_name}`
          : 'Non assigné'
      }));
      
      setClasses(formattedClasses || []);
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    formModal.openModal();
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    try {
      await supabase
        .from('classes')
        .delete()
        .eq('id', selectedClass.id);
      await fetchClasses();
      deleteModal.closeModal();
      setSelectedClass(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleFormSuccess = async () => {
    await fetchClasses();
    formModal.closeModal();
    setSelectedClass(null);
  };

  const getClassTypeLabel = (value: string) => {
    return CLASS_TYPES.find(type => type.value === value)?.label || value;
  };

  const getClassNameLabel = (value: string) => {
    return CLASS_NAMES.find(name => name.value === value)?.label || value;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Classes</h1>
        <button
          onClick={() => {
            setSelectedClass(null);
            formModal.openModal();
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <FolderPlus className="h-5 w-5" />
          Nouvelle Classe
        </button>
      </div>

      {loading ? (
        <div className="text-center">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getClassNameLabel(classItem.name)}
              </h3>
              <div className="text-sm text-gray-500">
                <p>Niveau: {classItem.level}</p>
                <p>Type: {getClassTypeLabel(classItem.class_type)}</p>
                <p>Professeur: {classItem.teacher_name}</p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(classItem)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    setSelectedClass(classItem);
                    deleteModal.openModal();
                  }}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={selectedClass ? 'Modifier une classe' : 'Ajouter une classe'}
      >
        <ClassForm
          classItem={selectedClass || undefined}
          onSuccess={handleFormSuccess}
          onCancel={formModal.closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Supprimer la classe"
        message="Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible."
      />
    </div>
  );
}