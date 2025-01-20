import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { Modal } from '../components/modals/Modal';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { UserForm } from '../components/users/UserForm';
import { useModal } from '../hooks/useModal';
import { fetchUsers, deleteUser } from '../services/userService';
import { User } from '../types/auth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  SECRETAIRE: 'Secrétaire',
  PROFESSEUR: 'Professeur'
};

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const formModal = useModal();
  const deleteModal = useModal();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await fetchUsers();
    setUsers(data);
    setLoading(false);
  }

  const handleDelete = async () => {
    if (!selectedUser) return;
    await deleteUser(selectedUser.id);
    await loadUsers();
    deleteModal.closeModal();
    setSelectedUser(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <button
          onClick={() => formModal.openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700"
        >
          <UserPlus className="h-5 w-5" />
          Nouvel Utilisateur
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.first_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ROLE_LABELS[user.role]}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
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

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title="Nouvel utilisateur"
      >
        <UserForm
          onSuccess={() => {
            loadUsers();
            formModal.closeModal();
          }}
          onCancel={formModal.closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
      />
    </div>
  );
}