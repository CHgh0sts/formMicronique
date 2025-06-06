'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Building, Clock, LogOut, Search, Lock, Key, Shield, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FoundUser {
  id: string;
  nom: string;
  prenom: string;
  societe?: string;
  heureArrivee: string;
}

export default function DepartPage() {
  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [presentUsers, setPresentUsers] = useState<FoundUser[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [processingDeparture, setProcessingDeparture] = useState<string | null>(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const authStatus = sessionStorage.getItem('depart_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Focus automatique sur le champ mot de passe
  useEffect(() => {
    if (!isAuthenticated && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // Mettre à jour l'heure côté client
      const updateTime = () => {
        setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
      };
      
      updateTime(); // Première mise à jour
      const interval = setInterval(updateTime, 1000); // Mise à jour chaque seconde
      
      // Charger les utilisateurs présents
      fetchPresentUsers();
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchPresentUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/users?today=true&presents=true');
      if (response.ok) {
        const users = await response.json();
        setPresentUsers(users);
      } else {
        toast.error('Erreur lors du chargement des visiteurs', {
          description: 'Impossible de contacter le serveur',
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des visiteurs:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter le serveur',
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simuler un délai de vérification
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === 'micronique') {
      setIsAuthenticated(true);
      sessionStorage.setItem('depart_authenticated', 'true');
      setPassword('');
      toast.success('Connexion réussie !', {
        description: 'Accès autorisé à l\'enregistrement des départs',
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
      <div className="relative h-screen overflow-hidden">
        {/* Background avec overlay */}
        <div className="absolute inset-0">
          <Image 
            src="/images/background.jpg" 
            alt="background" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/60 via-black/40 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 via-transparent to-red-900/20" />
        </div>

        {/* Header avec bouton retour */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <Link 
            href="/" 
            className="group flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
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
        <div className="relative z-10 flex items-center justify-center h-[calc(100vh-80px)] px-4">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              
              {/* Logo et titre */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl blur-lg opacity-30" />
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                      <Lock className="w-8 h-8 text-red-600 mx-auto" />
                    </div>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                    Départ
                  </span>
                </h1>
                <p className="text-white/70 text-sm">
                  Accès sécurisé pour l'enregistrement des départs
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
                      className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200"
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
                  className={`w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 ${
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
                  Accès réservé au personnel autorisé pour l'enregistrement des départs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDeparture = async (userId: string) => {
    setProcessingDeparture(userId);

    try {
      const response = await fetch('/api/users/depart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const user = presentUsers.find(u => u.id === userId);
        
        toast.success('Départ enregistré avec succès !', {
          description: `Au revoir ${user?.prenom} ${user?.nom}`,
          duration: 3000,
        });
        
        fetchPresentUsers();
        
        // Redirection automatique après 2 secondes
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error('Erreur lors de l\'enregistrement du départ', {
          description: errorData.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du départ:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter le serveur',
      });
    } finally {
      setProcessingDeparture(null);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background avec overlay */}
      <div className="absolute inset-0">
        <Image 
          src="/images/background.jpg" 
          alt="background" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 via-transparent to-red-900/20" />
      </div>

      {/* Header avec bouton retour */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <Link 
          href="/" 
          className="group flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Retour</span>
        </Link>
        
        <div className="flex items-center gap-2 text-white/80">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{currentTime}</span>
        </div>
      </div>

      {/* Contenu principal avec layout fixe */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-80px)] px-4">
        
        {/* Titre compact */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              Départ
            </span>
          </h1>
          <p className="text-base text-white/80">
            Enregistrez votre départ de nos locaux
          </p>
        </div>

        {/* Container principal avec scroll */}
        <div className="flex-1 flex flex-col items-center">
          
          {/* Box scrollable */}
          <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col max-h-[calc(100vh-280px)]">
            
            {/* Header de la box (fixe) */}
            <div className="p-6 pb-4 flex-shrink-0">
              {/* Logo compact */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl blur-lg opacity-30" />
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-2">
                    <Image 
                      src="/images/logo.png" 
                      alt="logo" 
                      width={40} 
                      height={40}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-white/90 text-base font-medium mb-1">
                  Liste des visiteurs présents aujourd'hui
                </h3>
                <p className="text-white/70 text-xs">
                  Cliquez sur le bouton de départ pour enregistrer le départ d'un visiteur
                </p>
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                
                {/* Liste des visiteurs présents */}
                {isLoadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto mb-4"></div>
                    <p className="text-white/70 text-sm">Chargement des visiteurs...</p>
                  </div>
                ) : presentUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/70 text-sm mb-2">Aucun visiteur présent aujourd'hui</p>
                    <p className="text-white/50 text-xs">Les visiteurs arrivés aujourd'hui apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {presentUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-white/60" />
                              <span className="text-white font-medium text-sm">{user.nom} {user.prenom}</span>
                            </div>
                            <div className="space-y-1 text-white/70 text-xs">
                              {user.societe && <p><span className="font-medium">Société:</span> {user.societe}</p>}
                              <p><span className="font-medium">Arrivée:</span> {new Date(user.heureArrivee).toLocaleString('fr-FR')}</p>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handleDeparture(user.id)}
                            disabled={processingDeparture === user.id}
                            whileHover={{ scale: processingDeparture === user.id ? 1 : 1.05 }}
                            whileTap={{ scale: processingDeparture === user.id ? 1 : 0.95 }}
                            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-lg transition-all duration-200 text-xs ${
                              processingDeparture === user.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <LogOut className="w-3 h-3" />
                            {processingDeparture === user.id ? 'Départ...' : 'Départ'}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Instructions compactes */}
                <div className="mt-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <h4 className="text-white/90 font-medium mb-1 text-xs">Instructions</h4>
                    <p className="text-white/70 text-xs leading-relaxed">
                      Cliquez sur le bouton de départ pour enregistrer le départ d'un visiteur.
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Note RGPD toujours visible */}
          <div className="mt-4 max-w-lg text-center flex-shrink-0">
            <p className="text-white/50 text-xs leading-relaxed">
              Vos données sont traitées conformément au RGPD et seront supprimées après 1 an.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 