import React, { useState, useEffect } from 'react';
import { FolderPlus, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { ClassForm } from '../components/forms/ClassForm';
import { Modal } from '../components/modals/Modal';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { ErrorDialog } from '../components/dialogs/ErrorDialog';
import { useModal } from '../hooks/useModal';
import { CLASS_TYPES } from '../constants/classTypes';
import { CLASS_LEVELS } from '../constants/classLevels';
import { useClasses } from '../hooks/useClasses';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function Classes() {
  const { 
    classes, 
    selectedClass,
    setSelectedClass,
    loading,
    error,
    loadClasses,
    deleteClass 
  } = useClasses();
  
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const formModal = useModal();
  const deleteModal = useModal();
  const errorModal = useModal();

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    formModal.openModal();
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    
    const { error } = await deleteClass(selectedClass.id);
    if (error) {
      deleteModal.closeModal();
      setSelectedClass(null);
      errorModal.openModal();
    } else {
      await loadClasses();
      deleteModal.closeModal();
      setSelectedClass(null);
    }
  };

  const handleFormSuccess = async () => {
    await loadClasses();
    formModal.closeModal();
    setSelectedClass(null);
  };

  const getClassTypeLabel = (value: string) => {
    return CLASS_TYPES.find(type => type.value === value)?.label || value;
  };

  const getClassLevelLabel = (value: string) => {
    return CLASS_LEVELS.find(level => level.value === value)?.label || value;
  };

  const toggleClassExpansion = (classId: string) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {classes.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getClassLevelLabel(classItem.level)}
                  </h3>
                  <p className="text-sm text-gray-500">Type: {getClassTypeLabel(classItem.class_type)}</p>
                  <p className="text-sm text-gray-500">
                    Professeur: {classItem.teachers ? `${classItem.teachers.first_name} ${classItem.teachers.last_name}` : 'Non assigné'}
                  </p>
                </div>
                <div className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{classItem.student_count || 0} élèves</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <button
                  onClick={() => toggleClassExpansion(classItem.id)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center"
                >
                  {expandedClass === classItem.id ? (
                    <>
                      Masquer les élèves
                      <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Voir les élèves
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
                <div className="flex gap-2">
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
            </div>

            {expandedClass === classItem.id && classItem.students && (
              <div className="border-t border-gray-200 px-4 sm:px-6 py-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Liste des élèves</h4>
                {classItem.students.length > 0 ? (
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {classItem.students.map((student) => (
                      <li key={student.id} className="text-sm text-gray-600">
                        {student.matricule} - {student.first_name} {student.last_name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">Aucun élève dans cette classe</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

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

      <ErrorDialog
        isOpen={errorModal.isOpen}
        onClose={errorModal.closeModal}
        title="Erreur de suppression"
        message={error || "Une erreur est survenue lors de la suppression de la classe"}
      />
    </div>
  );
}