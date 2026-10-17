import { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useSchoolYear } from '../contexts/SchoolYearContext';
import { AbsenceField } from '../components/grades/AbsenceField';
import { Modal } from '../components/modals/Modal';
import { GradeForm } from '../components/grades/GradeForm';
import { GradesList } from '../components/grades/GradesList';
import { ReportCard } from '../components/grades/ReportCard';
import { useModal } from '../hooks/useModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CLASS_LEVELS } from '../constants/classLevels';
import { fetchStudentGrades, deleteGrade, generateReportCard } from '../services/gradeService';
import { Grade, ReportCardData } from '../services/grade/types';

export function Grades() {
  const { students, loading } = useStudents();
  const { selectedYear, isCurrentYear } = useSchoolYear();
  // Past years can be viewed but not changed
  const readOnly = !isCurrentYear;
  const yearId = selectedYear?.id ?? '';
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  const [selectedTrimester, setSelectedTrimester] = useState(1);
  const [reportCardData, setReportCardData] = useState<ReportCardData | null>(null);
  const gradeModal = useModal();
  const reportCardModal = useModal();

  const getLevelLabel = (value: string) => {
    return CLASS_LEVELS.find(level => level.value === value)?.label || value;
  };

  const handleShowGrades = async (student: any) => {
    setSelectedStudent(student);
    await loadStudentGrades(student.id, 1);
    gradeModal.openModal();
  };

  const loadStudentGrades = async (studentId: string, trimester: number) => {
    const { data } = await fetchStudentGrades(studentId, trimester, yearId);
    setStudentGrades(data);
  };

  const handleDeleteGrade = async (grade: Grade) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      await deleteGrade(grade.id);
      await loadStudentGrades(grade.student_id, selectedTrimester);
    }
  };

  const handleFormSuccess = async () => {
    if (selectedStudent) {
      await loadStudentGrades(selectedStudent.id, selectedTrimester);
    }
  };

  const handleGenerateReportCard = async (student: any, trimester: number) => {
    try {
      const data = await generateReportCard(student.id, trimester, yearId);
      setReportCardData(data);
      reportCardModal.openModal();
    } catch (error) {
      console.error('Error generating report card:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Separate students by class type
  const frenchStudents = students.filter(s => s.class_type === 'FRANCAIS');
  const arabicStudents = students.filter(s => s.class_type === 'ARABE');

  const renderStudentsTable = (students: any[], title: string) => (
    <div className="card overflow-hidden">
      <h2 className="border-b border-slate-200 px-6 py-4 text-lg font-semibold text-slate-900">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Matricule</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Niveau</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">{student.matricule}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.first_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getLevelLabel(student.level)}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleShowGrades(student)}
                    className="font-medium text-brand-700 hover:text-brand-900"
                  >
                    {readOnly ? 'Voir les notes' : 'Gérer les notes'}
                  </button>
                  <div className="inline-flex space-x-2">
                    {[1, 2, 3].map((trimester) => (
                      <button
                        key={trimester}
                        onClick={() => handleGenerateReportCard(student, trimester)}
                        className="rounded-md bg-brand-50 px-2 py-0.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
                      >
                        Bulletin T{trimester}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Aucun élève
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="page-title mb-6">Gestion des Notes · {selectedYear?.label}</h1>

      <div className="space-y-8">
        {renderStudentsTable(frenchStudents, "Classes Françaises")}
        {renderStudentsTable(arabicStudents, "Classes Arabes")}
      </div>

      <Modal
        isOpen={gradeModal.isOpen}
        onClose={gradeModal.closeModal}
        title={`Gestion des notes - ${selectedStudent?.first_name} ${selectedStudent?.last_name}`}
        size="xl"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-x-2">
                {[1, 2, 3].map((trimester) => (
                  <button
                    key={trimester}
                    onClick={() => {
                      setSelectedTrimester(trimester);
                      loadStudentGrades(selectedStudent.id, trimester);
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      selectedTrimester === trimester
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Trimestre {trimester}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Notes enregistrées</h3>
                <GradesList
                  grades={studentGrades}
                  onDelete={handleDeleteGrade}
                  readOnly={readOnly}
                />
              </div>

              {readOnly ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Absences</h3>
                  <AbsenceField
                    studentId={selectedStudent.id}
                    trimester={selectedTrimester}
                    onSuccess={handleFormSuccess}
                    readOnly
                  />
                  <p className="text-sm text-slate-500">
                    Année {selectedYear?.label} en lecture seule : les notes s'ajoutent sur l'année en cours.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Nouvelle note</h3>
                  <GradeForm
                    studentId={selectedStudent.id}
                    classType={selectedStudent.class_type}
                    level={selectedStudent.level}
                    onSuccess={handleFormSuccess}
                    onCancel={gradeModal.closeModal}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={reportCardModal.isOpen}
        onClose={reportCardModal.closeModal}
        title="Bulletin de notes"
        size="xl"
      >
        {reportCardData && (
          <ReportCard
            data={reportCardData}
            onClose={reportCardModal.closeModal}
          />
        )}
      </Modal>
    </div>
  );
}