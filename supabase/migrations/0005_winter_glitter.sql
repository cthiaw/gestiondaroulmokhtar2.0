/*
  # Ajout du type de personnel

  1. Modifications
    - Ajout de la colonne `staff_type` à la table `teachers` avec une valeur par défaut
    - Mise à jour des enregistrements existants
    - Ajout de la contrainte NOT NULL
    - Ajout de la contrainte CHECK pour les types valides
    
  2. Sécurité
    - Maintien des politiques RLS existantes
*/

-- Ajout de la colonne avec une valeur par défaut
ALTER TABLE teachers ADD COLUMN staff_type text DEFAULT 'PROFESSEUR';

-- Mise à jour des enregistrements existants si nécessaire
UPDATE teachers SET staff_type = 'PROFESSEUR' WHERE staff_type IS NULL;

-- Ajout de la contrainte NOT NULL
ALTER TABLE teachers ALTER COLUMN staff_type SET NOT NULL;

-- Ajout de la contrainte CHECK pour les types valides
ALTER TABLE teachers ADD CONSTRAINT staff_type_check CHECK (
  staff_type IN ('PROFESSEUR', 'SECRETAIRE', 'GARDIEN')
);