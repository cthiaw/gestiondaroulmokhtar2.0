/*
  # Ajout du type de classe

  1. Modifications
    - Ajout de la colonne `class_type` à la table `classes`
    - Mise à jour des enregistrements existants
    - Ajout des contraintes
    
  2. Sécurité
    - Maintien des politiques RLS existantes
*/

-- Ajout de la colonne avec une valeur par défaut
ALTER TABLE classes ADD COLUMN class_type text DEFAULT 'FRANCAIS';

-- Mise à jour des enregistrements existants
UPDATE classes SET class_type = 'FRANCAIS' WHERE class_type IS NULL;

-- Ajout de la contrainte NOT NULL
ALTER TABLE classes ALTER COLUMN class_type SET NOT NULL;

-- Ajout de la contrainte CHECK pour les types valides
ALTER TABLE classes ADD CONSTRAINT class_type_check CHECK (
  class_type IN ('FRANCAIS', 'ARABE')
);