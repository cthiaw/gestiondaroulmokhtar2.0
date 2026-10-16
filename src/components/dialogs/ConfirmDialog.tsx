import React from 'react';
import { Modal } from '../modals/Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger"
          >
            Supprimer
          </button>
        </div>
      </div>
    </Modal>
  );
}