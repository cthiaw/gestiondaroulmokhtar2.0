import React, { useState, useEffect } from 'react';
import { CreditCard, Users, GraduationCap, School, BookText } from 'lucide-react';
import { DashboardStats } from '../types/dashboard';
import { StatCard } from '../components/ui/StatCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SubjectTable } from '../components/subjects/SubjectTable';
import { Subject } from '../services/subject';
import { Modal } from '../components/modals/Modal';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { SubjectForm } from '../components/forms/SubjectForm';
import { useModal } from '../hooks/useModal';
import { fetchDashboardStats } from '../services/dashboard';
import { useSubjects } from '../hooks/useSubjects';
import { useSchoolYear } from '../contexts/SchoolYearContext';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    studentCount: 0,
    teacherCount: 0,
    classCount: 0,
    monthlyIncome: 0
  });
  const [loading, setLoading] = useState(true);
  const formModal = useModal();
  const deleteModal = useModal();
  const { subjects, selectedSubject, setSelectedSubject, loadSubjects, createSubject, updateSubject, deleteSubject } = useSubjects();
  const { selectedYear, isCurrentYear } = useSchoolYear();
  const yearId = selectedYear?.id;

  useEffect(() => {
    Promise.all([loadStats(), loadSubjects()]).then(() => setLoading(false));
  }, [yearId]);

  async function loadStats() {
    if (!yearId) return;
    const stats = await fetchDashboardStats(yearId, isCurrentYear);
    setStats(stats);
  }

  const handleFormSuccess = async () => {
    await loadSubjects();
    formModal.closeModal();
    setSelectedSubject(null);
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;
    await deleteSubject(selectedSubject.id);
    await loadSubjects();
    deleteModal.closeModal();
    setSelectedSubject(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const frenchSubjects = subjects.filter(subject => subject.class_type === 'FRANCAIS');
  const arabicSubjects = subjects.filter(subject => subject.class_type === 'ARABE');

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">Vue d'ensemble de l'école · Année scolaire {selectedYear?.label}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Élèves"
          value={stats.studentCount.toString()}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Maîtres et maîtresses"
          value={stats.teacherCount.toString()}
          icon={GraduationCap}
          color="brand"
        />
        <StatCard
          title="Classes"
          value={stats.classCount.toString()}
          icon={School}
          color="violet"
        />
        <StatCard
          title={isCurrentYear ? 'Revenus du mois' : "Revenus de l'année"}
          value={`${stats.monthlyIncome.toLocaleString()} FCFA`}
          icon={CreditCard}
          color="amber"
        />
      </div>

      <div className="mt-10">
        <div className="page-header">
          <h2 className="text-xl font-semibold text-slate-900">Gestion des Matières</h2>
          <button
            onClick={() => {
              setSelectedSubject(null);
              formModal.openModal();
            }}
            className="btn-primary"
          >
            <BookText className="h-5 w-5" />
            Nouvelle Matière
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SubjectTable
            title="Matières Françaises"
            subjects={frenchSubjects}
            onEdit={(subject) => {
              setSelectedSubject(subject);
              formModal.openModal();
            }}
            onDelete={(subject) => {
              setSelectedSubject(subject);
              deleteModal.openModal();
            }}
          />

          <SubjectTable
            title="Matières Arabes"
            subjects={arabicSubjects}
            onEdit={(subject) => {
              setSelectedSubject(subject);
              formModal.openModal();
            }}
            onDelete={(subject) => {
              setSelectedSubject(subject);
              deleteModal.openModal();
            }}
          />
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