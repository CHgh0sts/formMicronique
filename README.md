# FormMicro2 - Registre des Visiteurs Moderne

## 🎯 Description

FormMicro2 est une application web moderne de gestion des visiteurs, conçue pour remplacer l'ancienne version avec un design contemporain et une expérience utilisateur améliorée. L'application permet l'enregistrement des arrivées et départs des visiteurs dans vos locaux.

## ✨ Fonctionnalités

- **Interface moderne** : Design élégant avec animations fluides et effets visuels
- **Enregistrement d'arrivée** : Formulaire complet pour l'enregistrement des visiteurs
- **Enregistrement de départ** : Système de recherche et confirmation de départ
- **Interface d'administration** : Tableau de bord avec statistiques et actions rapides
- **Responsive Design** : Compatible mobile, tablette et desktop
- **Animations** : Transitions fluides avec Framer Motion
- **Conformité RGPD** : Respect de la réglementation sur la protection des données

## 🛠️ Technologies Utilisées

- **Next.js 15** : Framework React avec App Router
- **TypeScript** : Typage statique pour une meilleure robustesse
- **Tailwind CSS** : Framework CSS utilitaire pour le styling
- **Framer Motion** : Bibliothèque d'animations
- **Lucide React** : Icônes modernes et cohérentes

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone [url-du-repo]
cd formmicro2

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📱 Pages Disponibles

### Page d'Accueil (`/`)

- Interface principale avec navigation vers arrivée/départ
- Design moderne avec background personnalisé
- Animations d'entrée et particules décoratives

### Page Arrivée (`/arrivee`)

- Formulaire d'enregistrement des visiteurs
- Champs : nom, prénom, société, email, téléphone, motif
- Validation côté client
- Design avec thème vert

### Page Départ (`/depart`)

- Recherche de visiteur par nom/prénom
- Confirmation de départ
- Design avec thème rouge

### Page Administration (`/admin`)

- Tableau de bord avec statistiques
- Actions rapides (export, paramètres, etc.)
- Interface sécurisée

## 🎨 Design et UX

### Palette de Couleurs

- **Arrivée** : Dégradés verts (green-500 → emerald-600)
- **Départ** : Dégradés rouges (red-500 → rose-600)
- **Admin** : Dégradés indigo/violet (indigo-500 → purple-600)
- **Background** : Overlays sombres avec transparence

### Animations

- Animations d'entrée en cascade
- Effets de hover et de focus
- Particules décoratives animées
- Transitions fluides entre les états

### Responsive Design

- Mobile-first approach
- Grilles adaptatives
- Typographie responsive
- Espacement optimisé

## 🔧 Structure du Projet

```
formmicro2/
├── src/
│   └── app/
│       ├── page.tsx          # Page d'accueil
│       ├── layout.tsx        # Layout principal
│       ├── globals.css       # Styles globaux
│       ├── arrivee/
│       │   └── page.tsx      # Page d'arrivée
│       ├── depart/
│       │   └── page.tsx      # Page de départ
│       └── admin/
│           └── page.tsx      # Page d'administration
├── public/
│   └── images/
│       ├── background.jpg    # Image de fond
│       ├── logo.png         # Logo de l'entreprise
│       └── logo.svg         # Logo vectoriel
└── README.md
```

## 🔒 Sécurité et Conformité

### RGPD

- Information claire sur la collecte de données
- Durée de conservation spécifiée (1 an)
- Droits des utilisateurs mentionnés
- Base légale : sécurité des locaux

### Sécurité

- Validation côté client
- Métadonnées sécurisées
- Interface d'administration protégée
- Pas d'indexation par les moteurs de recherche

## 🚀 Déploiement

### Build de Production

```bash
# Créer le build de production
npm run build

# Démarrer en mode production
npm start
```

### Variables d'Environnement

Créer un fichier `.env.local` pour les variables d'environnement :

```env
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

## 📈 Améliorations Futures

- [ ] Base de données pour la persistance
- [ ] Authentification pour l'administration
- [ ] Export PDF des registres
- [ ] Notifications en temps réel
- [ ] API REST pour intégrations
- [ ] Mode hors ligne (PWA)
- [ ] Signature électronique
- [ ] Photos des visiteurs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support, contactez l'équipe de développement.

---

**FormMicro2** - Une solution moderne pour la gestion des visiteurs 🏢✨
