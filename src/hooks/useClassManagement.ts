import { useState } from 'react';
import { Class, CreateClassData, UpdateClassData } from '../types/class';
import {
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
  fetchClassById
} from '../services/classService';

export function useClassManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await fetchClasses();
      if (error) throw error;
      return data;
    } catch (err) {
      setError('Erreur lors du chargement des classes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addClass = async (classData: CreateClassData) => {
    setError(null);
    try {
      const { data, error } = await createClass(classData);
      if (error) throw error;
      return data;
    } catch (err) {
      setError('Erreur lors de la création de la classe');
      return null;
    }
  };

  const editClass = async (id: string, classData: UpdateClassData) => {
    setError(null);
    try {
      const { data, error } = await updateClass(id, classData);
      if (error) throw error;
      return data;
    } catch (err) {
      setError('Erreur lors de la modification de la classe');
      return null;
    }
  };

  const removeClass = async (id: string) => {
    setError(null);
    try {
      const { error } = await deleteClass(id);
      if (error) throw error;
      return true;
    } catch (err) {
      setError('Erreur lors de la suppression de la classe');
      return false;
    }
  };

  const getClassById = async (id: string) => {
    setError(null);
    try {
      const { data, error } = await fetchClassById(id);
      if (error) throw error;
      return data;
    } catch (err) {
      setError('Erreur lors du chargement de la classe');
      return null;
    }
  };

  return {
    loading,
    error,
    loadClasses,
    addClass,
    editClass,
    removeClass,
    getClassById
  };
}