import { PrismaClient, QuestionType } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Supprimer les questions existantes
  await prisma.question.deleteMany()

  // Créer des questions d'exemple
  const questions = [
    {
      titre: "Avez-vous un badge visiteur ?",
      type: QuestionType.RADIO,
      options: JSON.stringify(["Oui", "Non"]),
      required: true,
      active: true,
      ordre: 1
    },
    {
      titre: "Personne à rencontrer",
      type: QuestionType.TEXT,
      placeholder: "Nom de la personne à rencontrer",
      required: true,
      active: true,
      ordre: 2
    },
    {
      titre: "Département",
      type: QuestionType.SELECT,
      options: JSON.stringify(["Direction", "Ressources Humaines", "Informatique", "Commercial", "Production", "Autre"]),
      required: false,
      active: true,
      ordre: 3
    },
    {
      titre: "Avez-vous des équipements à déclarer ?",
      type: QuestionType.CHECKBOX,
      options: JSON.stringify(["Ordinateur portable", "Téléphone", "Appareil photo", "Clé USB", "Autre matériel électronique"]),
      required: false,
      active: true,
      ordre: 4
    },
    {
      titre: "Commentaires supplémentaires",
      type: QuestionType.TEXTAREA,
      placeholder: "Informations complémentaires...",
      required: false,
      active: true,
      ordre: 5
    }
  ]

  for (const question of questions) {
    await prisma.question.create({
      data: question
    })
  }

  console.log('Questions d\'exemple créées avec succès!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 