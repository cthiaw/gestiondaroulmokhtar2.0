import React, { useState, useEffect } from 'react';
import { CreditCard, Users, GraduationCap, School, BookText } from 'lucide-react';
import { DashboardStats } from '../types/dashboard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SubjectTable } from '../components/subjects/SubjectTable';
import { Subject } from '../services/subject';
import { Modal } from '../components/modals/Modal';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { SubjectForm } from '../components/forms/SubjectForm';
import { useModal } from '../hooks/useModal';
import { fetchDashboardStats } from '../services/dashboard';
import { useSubjects } from '../hooks/useSubjects';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    yellow: 'bg-yellow-50',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 sm:p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

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

  useEffect(() => {
    Promise.all([loadStats(), loadSubjects()]).then(() => setLoading(false));
  }, []);

  async function loadStats() {
    const stats = await fetchDashboardStats();
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Élèves"
          value={stats.studentCount.toString()}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Total Professeurs"
          value={stats.teacherCount.toString()}
          icon={<GraduationCap className="h-6 w-6 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Classes"
          value={stats.classCount.toString()}
          icon={<School className="h-6 w-6 text-purple-600" />}
          color="purple"
        />
        <StatCard
          title="Revenus du mois"
          value={`${stats.monthlyIncome.toLocaleString()} FCFA`}
          icon={<CreditCard className="h-6 w-6 text-yellow-600" />}
          color="yellow"
        />
      </div>

      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Gestion des Matières</h2>
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