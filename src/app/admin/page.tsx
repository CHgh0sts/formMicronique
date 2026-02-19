'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users, Download, Settings, BarChart3, Clock, Shield, Plus, Edit, Trash2, Eye, EyeOff, Lock, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import DraggableQuestionList from '@/components/DraggableQuestionList';

// Types
type QuestionType = 'TEXT' | 'EMAIL' | 'TEL' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'NUMBER' | 'DATE';
type EntryType = 'VERIFY' | 'MANUAL' | 'AUTO';

interface Question {
  id: string;
  titre: string;
  type: QuestionType;
  options?: string | null;
  placeholder?: string | null;
  required: boolean;
  active: boolean;
  ordre: number;
}

interface User {
  id: string;
  nom: string;
  prenom: string;
  societe?: string;
  email?: string;
  telephone?: string;
  motif?: string;
  reponses?: string;
  heureArrivee: string;
  heureDepart?: string;
  estPresent: boolean;
  arriveType: EntryType;
  departType: EntryType;
}

interface QuestionForm {
  titre: string;
  type: QuestionType;
  options: string[];
  placeholder: string;
  required: boolean;
  active: boolean;
}

interface EditUserForm {
  heureArrivee: string;
  heureDepart: string;
}

export default function AdminPage() {
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'users'>('dashboard');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    titre: '',
    type: 'TEXT',
    options: [],
    placeholder: '',
    required: false,
    active: true
  });
  const [editUserForm, setEditUserForm] = useState<EditUserForm>({
    heureArrivee: '',
    heureDepart: ''
  });
  const [stats, setStats] = useState({
    visitorsToday: 0,
    currentlyPresent: 0,
    totalThisMonth: 0
  });

  // Charger les données seulement si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      fetchQuestions();
      fetchUsers();
      fetchStats();
    }
  }, [isAuthenticated]);

  // Focus automatique sur le champ mot de passe
  useEffect(() => {
    if (!isAuthenticated && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simuler un délai de vérification
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === 'micronique') {
      setIsAuthenticated(true);
      setPassword('');
      toast.success('Connexion réussie !', {
        description: 'Bienvenue dans l\'espace d\'administration',
      });
    } else {
      toast.error('Mot de passe incorrect', {
        description: 'Veuillez vérifier votre mot de passe et réessayer',
      });
    }
    
    setIsLoading(false);
  };

  // Si pas authentifié, afficher la page de connexion
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        {/* Background avec overlay */}
        <div className="absolute inset-0">
          <Image 
            src="/images/background.jpg" 
            alt="background" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-black/60 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-slate-900/20" />
        </div>

        {/* Header avec bouton retour */}
        <div className="relative z-10 flex items-center justify-between p-6">
          <Link 
            href="/" 
            className="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          
          <div className="flex items-center gap-2 text-white/80">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Accès sécurisé</span>
          </div>
        </div>

        {/* Contenu de connexion */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              
              {/* Logo et titre */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-30" />
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                      <Lock className="w-8 h-8 text-indigo-600 mx-auto" />
                    </div>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Administration
                  </span>
                </h1>
                <p className="text-white/70 text-sm">
                  Accès réservé aux administrateurs
                </p>
              </div>

              {/* Formulaire de connexion */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-white/90 text-sm font-medium flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                      placeholder="Entrez le mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Bouton de connexion */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className={`w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  {isLoading ? 'Vérification...' : 'Se connecter'}
                </motion.button>
              </form>

              {/* Note de sécurité */}
              <div className="mt-6 text-center">
                <p className="text-white/50 text-xs">
                  Cet espace est protégé et réservé aux administrateurs autorisés
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Charger les données
  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        toast.error('Erreur lors du chargement des questions', {
          description: 'Impossible de récupérer les questions',
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter le serveur',
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Erreur lors du chargement des utilisateurs', {
          description: 'Impossible de récupérer les utilisateurs',
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter le serveur',
      });
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [todayResponse, presentResponse, monthResponse] = await Promise.all([
        fetch(`/api/users?date=${today}`),
        fetch('/api/users?today=true&presents=true'),
        fetch(`/api/users?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`)
      ]);

      const todayData = todayResponse.ok ? await todayResponse.json() : [];
      const presentData = presentResponse.ok ? await presentResponse.json() : [];
      const monthData = monthResponse.ok ? await monthResponse.json() : [];

      setStats({
        visitorsToday: todayData.length,
        currentlyPresent: presentData.length,
        totalThisMonth: monthData.length
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Erreur lors du chargement des statistiques', {
        description: 'Impossible de récupérer les statistiques',
      });
    }
  };

  // Gestion des questions
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingQuestion ? `/api/questions/${editingQuestion.id}` : '/api/questions';
      const method = editingQuestion ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...questionForm,
          options: questionForm.options.length > 0 ? questionForm.options.join(',') : null
        })
      });

      if (response.ok) {
        toast.success(editingQuestion ? 'Question modifiée avec succès !' : 'Question créée avec succès !', {
          description: `La question "${questionForm.titre}" a été ${editingQuestion ? 'modifiée' : 'créée'}`,
        });
        fetchQuestions();
        resetQuestionForm();
        setShowQuestionForm(false);
        setEditingQuestion(null);
      } else {
        const errorData = await response.json();
        toast.error('Erreur lors de la sauvegarde', {
          description: errorData.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter le serveur',
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const response = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Question supprimée avec succès !', {
          description: 'La question a été supprimée définitivement',
        });
        fetchQuestions();
      } else {
        toast.error('Erreur lors de la suppression', {
          description: 'Impossible de supprimer la question',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter le serveur',
      });
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      titre: question.titre,
      type: question.type,
      options: question.options ? JSON.parse(question.options) : [],
      placeholder: question.placeholder || '',
      required: question.required,
      active: question.active
    });
    setShowQuestionForm(true);
  };

  const handleQuestionsReorder = async (reorderedQuestions: Question[]) => {
    try {
      const response = await fetch('/api/questions/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: reorderedQuestions })
      });

      if (response.ok) {
        toast.success('Ordre des questions mis à jour !', {
          description: 'Les questions ont été réorganisées',
        });
        setQuestions(reorderedQuestions);
      } else {
        toast.error('Erreur lors de la mise à jour de l\'ordre', {
          description: 'Impossible de réorganiser les questions',
        });
        console.error('Erreur lors de la mise à jour de l\'ordre');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter le serveur',
      });
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      titre: '',
      type: 'TEXT',
      options: [],
      placeholder: '',
      required: false,
      active: true
    });
    setEditingQuestion(null);
    setShowQuestionForm(false);
  };

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, '']
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const removeOption = (index: number) => {
    setQuestionForm({
      ...questionForm,
      options: questionForm.options.filter((_, i) => i !== index)
    });
  };

  const parseUserResponses = (reponses: string | undefined) => {
    if (!reponses) return [];
    try {
      return JSON.parse(reponses);
    } catch {
      return [];
    }
  };

  const getResponseForQuestion = (userResponses: any[], questionId: string) => {
    const response = userResponses.find(r => r[questionId]);
    return response ? response[questionId] : 'Non renseigné';
  };

  // Gestion de l'édition des utilisateurs
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    
    // Fonction pour convertir une date UTC en datetime-local français
    const toLocalDateTimeString = (dateString: string) => {
      const date = new Date(dateString);
      // Créer une date locale sans conversion de timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    setEditUserForm({
      heureArrivee: toLocalDateTimeString(user.heureArrivee),
      heureDepart: user.heureDepart ? toLocalDateTimeString(user.heureDepart) : ''
    });
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // Fonction pour convertir une date UTC en datetime-local français
      const toLocalDateTimeString = (dateString: string) => {
        const date = new Date(dateString);
        // Créer une date locale sans conversion de timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Vérifier si l'heure d'arrivée a été modifiée
      const originalArrivee = toLocalDateTimeString(editingUser.heureArrivee);
      const arriveeModified = editUserForm.heureArrivee !== originalArrivee;

      // Vérifier si l'heure de départ a été modifiée
      const originalDepart = editingUser.heureDepart ? toLocalDateTimeString(editingUser.heureDepart) : '';
      const departModified = editUserForm.heureDepart !== originalDepart;

      const updateData: any = {};

      // Convertir les heures saisies (heure locale) en ISO UTC pour que le serveur enregistre le bon instant.
      // Sinon "14:00" serait interprété comme 14:00 UTC côté serveur et s'afficherait 15:00 en France.
      const localToISO = (datetimeLocal: string) =>
        new Date(datetimeLocal).toISOString();

      // Mettre à jour l'heure d'arrivée seulement si modifiée
      if (arriveeModified) {
        updateData.heureArrivee = localToISO(editUserForm.heureArrivee);
        updateData.arriveType = 'MANUAL';
      }

      // Mettre à jour l'heure de départ seulement si modifiée
      if (departModified) {
        if (editUserForm.heureDepart) {
          updateData.heureDepart = localToISO(editUserForm.heureDepart);
          updateData.departType = 'MANUAL';
        } else {
          updateData.heureDepart = null;
          updateData.departType = 'VERIFY';
        }
      }

      // Vérifier s'il y a des modifications à envoyer
      if (!arriveeModified && !departModified) {
        toast.info('Aucune modification détectée', {
          description: 'Les heures n\'ont pas été modifiées',
        });
        setEditingUser(null);
        setEditUserForm({ heureArrivee: '', heureDepart: '' });
        return;
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast.success('Utilisateur mis à jour avec succès !', {
          description: `Les heures de ${editingUser.prenom} ${editingUser.nom} ont été modifiées`,
        });
        fetchUsers();
        setEditingUser(null);
        setEditUserForm({ heureArrivee: '', heureDepart: '' });
      } else {
        const errorData = await response.json();
        toast.error('Erreur lors de la mise à jour', {
          description: errorData.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter le serveur',
      });
    }
  };

  const cancelUserEdit = () => {
    setEditingUser(null);
    setEditUserForm({ heureArrivee: '', heureDepart: '' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background avec overlay */}
      <div className="absolute inset-0">
        <Image 
          src="/images/background.jpg" 
          alt="background" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-slate-900/20" />
      </div>

      {/* Header avec bouton retour */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <Link 
          href="/" 
          className="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Retour</span>
        </Link>
        
        <div className="flex items-center gap-2 text-white/80">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Administration</span>
        </div>
      </div>

      {/* Contenu principal avec hauteur fixe */}
      <div className="relative z-10 px-4 pb-8 h-[calc(100vh-120px)] flex flex-col">
        
        {/* Titre */}
        <div className="text-center mb-8 flex-shrink-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Administration
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Gestion des questions et visualisation des visiteurs
          </p>
        </div>

        {/* Navigation par onglets */}
        <div className="flex justify-center mb-8 flex-shrink-0">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
            <div className="flex gap-2">
              {[
                { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
                { id: 'questions', label: 'Questions', icon: Settings },
                { id: 'users', label: 'Visiteurs', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu des onglets avec flex-1 pour prendre l'espace restant */}
        <div className="max-w-6xl mx-auto w-full flex-1 min-h-0">
          
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Visiteurs aujourd\'hui', value: stats.visitorsToday, icon: Users, color: 'from-blue-500 to-blue-600' },
                  { label: 'Présents actuellement', value: stats.currentlyPresent, icon: Clock, color: 'from-green-500 to-green-600' },
                  { label: 'Total ce mois', value: stats.totalThisMonth, icon: BarChart3, color: 'from-purple-500 to-purple-600' },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  onClick={() => setActiveTab('questions')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-4 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-200"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Gérer les questions</h3>
                    <p className="text-white/70 text-sm">Créer, modifier, supprimer</p>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('users')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-4 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-200"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-1">Voir les visiteurs</h3>
                    <p className="text-white/70 text-sm">Liste et détails</p>
                  </div>
                </motion.button>
              </div>
            </div>
          )}

          {/* Gestion des questions avec drag and drop */}
          {activeTab === 'questions' && (
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex justify-between items-center flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-white">Gestion des questions</h2>
                  <p className="text-white/60 text-sm mt-1">Glissez-déposez pour réorganiser l'ordre</p>
                </div>
                <motion.button
                  onClick={() => setShowQuestionForm(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle question
                </motion.button>
              </div>

              {/* Liste des questions avec drag and drop */}
              <div className="flex-1 min-h-0">
                <div className="h-full max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <DraggableQuestionList
                    questions={questions}
                    onQuestionsReorder={handleQuestionsReorder}
                    onEditQuestion={handleEditQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                  />
                </div>
              </div>

              {/* Formulaire de question */}
              {showQuestionForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-bold text-white mb-6">
                      {editingQuestion ? 'Modifier la question' : 'Nouvelle question'}
                    </h3>
                    
                    <form onSubmit={handleQuestionSubmit} className="space-y-4">
                      <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">Titre *</label>
                        <input
                          type="text"
                          value={questionForm.titre}
                          onChange={(e) => setQuestionForm({ ...questionForm, titre: e.target.value })}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          placeholder="Titre de la question"
                        />
                      </div>

                      <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">Type</label>
                        <select
                          value={questionForm.type}
                          onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value as QuestionType })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          aria-label="Type de question"
                        >
                          <option value="TEXT" className="bg-gray-800">Texte</option>
                          <option value="EMAIL" className="bg-gray-800">Email</option>
                          <option value="TEL" className="bg-gray-800">Téléphone</option>
                          <option value="TEXTAREA" className="bg-gray-800">Zone de texte</option>
                          <option value="SELECT" className="bg-gray-800">Liste déroulante</option>
                          <option value="RADIO" className="bg-gray-800">Boutons radio</option>
                          <option value="CHECKBOX" className="bg-gray-800">Cases à cocher</option>
                          <option value="NUMBER" className="bg-gray-800">Nombre</option>
                          <option value="DATE" className="bg-gray-800">Date</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">Placeholder</label>
                        <input
                          type="text"
                          value={questionForm.placeholder}
                          onChange={(e) => setQuestionForm({ ...questionForm, placeholder: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          placeholder="Texte d'aide"
                        />
                      </div>

                      {/* Options pour SELECT, RADIO, CHECKBOX */}
                      {['SELECT', 'RADIO', 'CHECKBOX'].includes(questionForm.type) && (
                        <div>
                          <label className="block text-white/90 text-sm font-medium mb-2">Options</label>
                          <div className="space-y-2">
                            {questionForm.options.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(index, e.target.value)}
                                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                  placeholder={`Option ${index + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(index)}
                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                  aria-label={`Supprimer l'option ${index + 1}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={addOption}
                              className="flex items-center gap-2 px-3 py-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all duration-200"
                            >
                              <Plus className="w-4 h-4" />
                              Ajouter une option
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Toggle Obligatoire */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white/90 font-medium text-sm mb-1">Obligatoire</h4>
                              <p className="text-white/60 text-xs">Cette question doit être remplie</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setQuestionForm({ ...questionForm, required: !questionForm.required })}
                              aria-label={`${questionForm.required ? 'Désactiver' : 'Activer'} le caractère obligatoire`}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent ${
                                questionForm.required 
                                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600' 
                                  : 'bg-white/20'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                  questionForm.required ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Toggle Active */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white/90 font-medium text-sm mb-1">Active</h4>
                              <p className="text-white/60 text-xs">Question visible aux visiteurs</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setQuestionForm({ ...questionForm, active: !questionForm.active })}
                              aria-label={`${questionForm.active ? 'Désactiver' : 'Activer'} la question`}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent ${
                                questionForm.active 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                  : 'bg-white/20'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                  questionForm.active ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
                        >
                          {editingQuestion ? 'Modifier' : 'Créer'}
                        </button>
                        <button
                          type="button"
                          onClick={resetQuestionForm}
                          className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Liste des utilisateurs */}
          {activeTab === 'users' && (
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex justify-between items-center flex-shrink-0">
                <h2 className="text-2xl font-bold text-white">Liste des visiteurs</h2>
                
                {/* Légende des couleurs */}
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3">
                  <span className="text-white/70 text-sm font-medium">Légende :</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-green-300 text-xs">Vérifié</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-blue-300 text-xs">Manuel</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-orange-500"></div>
                    <span className="text-orange-300 text-xs">Auto</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-h-0">
                <div className="h-full max-h-[60vh] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {users.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
                      <div className="text-white/60 mb-4">
                        <Users className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-lg font-medium">Aucun visiteur enregistré</p>
                        <p className="text-sm">Les visiteurs apparaîtront ici après leur enregistrement</p>
                      </div>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-medium">{user.nom} {user.prenom}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.estPresent ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                              }`}>
                                {user.estPresent ? 'Présent' : 'Parti'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/70 text-sm">
                              <div>
                                <span className="font-medium">Société:</span> {user.societe || 'Non renseigné'}
                              </div>
                              <div>
                                <span className={`font-medium ${
                                  user.arriveType === 'VERIFY' ? 'text-green-300' :
                                  user.arriveType === 'MANUAL' ? 'text-blue-300' :
                                  'text-orange-300'
                                }`}>
                                  {new Date(user.heureArrivee).toLocaleString('fr-FR')}
                                </span>
                              </div>
                              <div>
                                {user.heureDepart ? (
                                  <span className={`font-medium ${
                                    user.departType === 'VERIFY' ? 'text-green-300' :
                                    user.departType === 'MANUAL' ? 'text-blue-300' :
                                    'text-orange-300'
                                  }`}>
                                    {new Date(user.heureDepart).toLocaleString('fr-FR')}
                                  </span>
                                ) : (
                                  <span className="text-white/50 font-medium">En cours</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => handleEditUser(user)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-all duration-200"
                              title="Modifier les heures"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                              title="Voir les détails"
                            >
                              {selectedUser?.id === user.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </motion.button>
                          </div>
                        </div>

                        {/* Détails du visiteur */}
                        {selectedUser?.id === user.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-white/20"
                          >
                            {/* Réponses aux questions personnalisées */}
                            {user.reponses && (
                              <div>
                                <h4 className="text-white/90 font-medium mb-3">Réponses aux questions personnalisées:</h4>
                                <div className="space-y-2">
                                  {parseUserResponses(user.reponses).map((response: any, index: number) => {
                                    const questionId = Object.keys(response)[0];
                                    const answer = response[questionId];
                                    const question = questions.find(q => q.id === questionId);
                                    
                                    return (
                                      <div key={index} className="bg-white/5 rounded-lg p-3">
                                        <div className="text-white/90 text-sm font-medium mb-1">
                                          {question?.titre || `Question ${questionId}`}
                                        </div>
                                        <div className="text-white/70 text-sm">
                                          {answer || 'Non renseigné'}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal d'édition des heures */}
              {editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full">
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Modifier les heures - {editingUser.prenom} {editingUser.nom}
                    </h3>
                    
                    <form onSubmit={handleUserUpdate} className="space-y-4">
                      <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">Heure d'arrivée *</label>
                        <input
                          type="datetime-local"
                          value={editUserForm.heureArrivee}
                          onChange={(e) => setEditUserForm({ ...editUserForm, heureArrivee: e.target.value })}
                          required
                          title="Sélectionnez l'heure d'arrivée"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">Heure de départ</label>
                        <input
                          type="datetime-local"
                          value={editUserForm.heureDepart}
                          onChange={(e) => setEditUserForm({ ...editUserForm, heureDepart: e.target.value })}
                          title="Sélectionnez l'heure de départ (optionnel)"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <p className="text-white/60 text-xs mt-1">Laissez vide si le visiteur est encore présent</p>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                        >
                          Mettre à jour
                        </button>
                        <button
                          type="button"
                          onClick={cancelUserEdit}
                          className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 