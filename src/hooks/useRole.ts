import { useAuth } from '../contexts/AuthContext';

export function useRole() {
  const { user } = useAuth();
  
  // Vérifier si l'utilisateur est connecté et a un rôle
  if (!user?.role) {
    return {
      isAdmin: false,
      isSecretaire: false,
      isProfesseur: false,
      canAccessUsers: false,
      canAccessFinances: false,
      canAccessGrades: false,
      canManageStudents: false,
      canManageClasses: false,
      canManageTeachers: false
    };
  }

  const isAdmin = user.role === 'ADMIN';
  const isSecretaire = user.role === 'SECRETAIRE';
  const isProfesseur = user.role === 'PROFESSEUR';

  // Si c'est un admin, il a accès à tout
  if (isAdmin) {
    return {
      isAdmin: true,
      isSecretaire: false,
      isProfesseur: false,
      canAccessUsers: true,
      canAccessFinances: true,
      canAccessGrades: true,
      canManageStudents: true,
      canManageClasses: true,
      canManageTeachers: true
    };
  }

  // Pour les autres rôles, définir les permissions spécifiques
  return {
    isAdmin,
    isSecretaire,
    isProfesseur,
    canAccessUsers: false, // Seul l'admin peut gérer les utilisateurs
    canAccessFinances: isSecretaire, // Secrétaire et admin peuvent accéder aux finances
    canAccessGrades: isProfesseur, // Professeur et admin peuvent accéder aux notes
    canManageStudents: isSecretaire, // Secrétaire et admin peuvent gérer les élèves
    canManageClasses: false, // Seul l'admin peut gérer les classes
    canManageTeachers: false // Seul l'admin peut gérer les enseignants
  };
}