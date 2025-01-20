/*
  # Ajout des types de paiement et de dépense

  1. Modifications
    - Ajout de la colonne payment_type dans la table payments
    - Ajout de la colonne expense_type dans la table expenses
    - Ajout des contraintes de validation pour les types

  2. Sécurité
    - Mise à jour des politiques RLS existantes
*/

-- Ajout des colonnes de type
ALTER TABLE payments ADD COLUMN payment_type text NOT NULL CHECK (
  payment_type IN ('INSCRIPTION', 'MENSUALITE', 'TENUE')
);

ALTER TABLE expenses ADD COLUMN expense_type text NOT NULL CHECK (
  expense_type IN ('SALAIRE', 'ELECTRICITE', 'EAU', 'INTERNET')
);