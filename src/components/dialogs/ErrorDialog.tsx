import React from 'react';
import { Modal } from '../modals/Modal';
import { AlertTriangle } from 'lucide-react';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function ErrorDialog({ isOpen, onClose, title, message }: ErrorDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-center text-gray-600">{message}</p>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Fermer
        </button>
      </div>
    </Modal>
  );
}