/*
  # Ajout du matricule et suppression de l'email

  1. Modifications
    - Ajout de la colonne matricule (text) à la table students
    - Ajout de la colonne matricule (text) à la table teachers
    - Suppression de la colonne email de la table teachers

  2. Contraintes
    - Les matricules doivent être uniques
    - Les matricules ne peuvent pas être null
*/

-- Ajout des colonnes matricule
ALTER TABLE students ADD COLUMN matricule text UNIQUE NOT NULL DEFAULT '';
ALTER TABLE teachers ADD COLUMN matricule text UNIQUE NOT NULL DEFAULT '';

-- Suppression de la colonne email
ALTER TABLE teachers DROP COLUMN email;

-- Suppression des valeurs par défaut après l'ajout
ALTER TABLE students ALTER COLUMN matricule DROP DEFAULT;
ALTER TABLE teachers ALTER COLUMN matricule DROP DEFAULT;