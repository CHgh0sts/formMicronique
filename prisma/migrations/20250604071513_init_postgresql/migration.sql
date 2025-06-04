-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'EMAIL', 'TEL', 'TEXTAREA', 'SELECT', 'RADIO', 'CHECKBOX', 'NUMBER', 'DATE');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('VERIFY', 'MANUAL', 'AUTO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "societe" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "motif" TEXT,
    "reponses" TEXT,
    "heureArrivee" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heureDepart" TIMESTAMP(3),
    "estPresent" BOOLEAN NOT NULL DEFAULT true,
    "arriveType" "EntryType" NOT NULL DEFAULT 'VERIFY',
    "departType" "EntryType" NOT NULL DEFAULT 'VERIFY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "options" TEXT,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);
