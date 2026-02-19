-- DropTable: suppression de la table face_embeddings (détection faciale retirée du projet).
-- Les tables users et questions ne sont pas modifiées, aucune donnée utile n'est perdue.
DROP TABLE IF EXISTS "face_embeddings";
