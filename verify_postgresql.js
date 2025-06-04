const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function verifyPostgreSQL() {
  try {
    console.log('🔍 Vérification de la migration PostgreSQL...\n');
    
    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion PostgreSQL réussie');
    
    // Compter les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`👥 Utilisateurs: ${userCount}`);
    
    // Compter les questions
    const questionCount = await prisma.question.count();
    console.log(`❓ Questions: ${questionCount}`);
    
    // Utilisateurs présents
    const presentCount = await prisma.user.count({ where: { estPresent: true } });
    console.log(`🟢 Utilisateurs présents: ${presentCount}`);
    
    // Utilisateurs avec réponses
    const withResponsesCount = await prisma.user.count({ 
      where: { reponses: { not: null } } 
    });
    console.log(`💬 Utilisateurs avec réponses: ${withResponsesCount}`);
    
    // Types d'entrée
    const verifyCount = await prisma.user.count({ where: { departType: 'VERIFY' } });
    const manualCount = await prisma.user.count({ where: { departType: 'MANUAL' } });
    const autoCount = await prisma.user.count({ where: { departType: 'AUTO' } });
    
    console.log('\n📊 Types de départ:');
    console.log(`   🟢 VERIFY: ${verifyCount}`);
    console.log(`   🔵 MANUAL: ${manualCount}`);
    console.log(`   🟠 AUTO: ${autoCount}`);
    
    // Dernier utilisateur ajouté
    const lastUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { prenom: true, nom: true, createdAt: true }
    });
    
    if (lastUser) {
      console.log(`\n👤 Dernier utilisateur: ${lastUser.prenom} ${lastUser.nom}`);
      console.log(`   📅 Ajouté le: ${lastUser.createdAt.toLocaleString('fr-FR')}`);
    }
    
    console.log('\n🎉 Migration PostgreSQL réussie !');
    console.log('📍 Base de données: PostgreSQL sur 147.79.101.194:9535');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPostgreSQL(); 