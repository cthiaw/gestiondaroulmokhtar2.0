import React, { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import { Modal } from '../components/modals/Modal';
import { GradeForm } from '../components/grades/GradeForm';
import { GradesList } from '../components/grades/GradesList';
import { ReportCard } from '../components/grades/ReportCard';
import { useModal } from '../hooks/useModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CLASS_LEVELS } from '../constants/classLevels';
import { fetchStudentGrades, deleteGrade, generateReportCard } from '../services/gradeService';
import { Grade, ReportCardData } from '../types/grades';

export function Grades() {
  const { students, loading } = useStudents();
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
    const { data } = await fetchStudentGrades(studentId, trimester);
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
      const data = await generateReportCard(student.id, trimester);
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Matricule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Niveau</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">{student.matricule}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.first_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getLevelLabel(student.level)}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleShowGrades(student)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Gérer les notes
                  </button>
                  <div className="inline-flex space-x-2">
                    {[1, 2, 3].map((trimester) => (
                      <button
                        key={trimester}
                        onClick={() => handleGenerateReportCard(student, trimester)}
                        className="text-green-600 hover:text-green-900"
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestion des Notes</h1>

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
                    className={`px-4 py-2 rounded-md ${
                      selectedTrimester === trimester
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Nouvelle note</h3>
                <GradeForm
                  studentId={selectedStudent.id}
                  classType={selectedStudent.class_type}
                  onSuccess={handleFormSuccess}
                  onCancel={gradeModal.closeModal}
                />
              </div>
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