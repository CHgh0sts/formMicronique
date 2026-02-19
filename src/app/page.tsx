'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Clock, Users, Settings, UserPlus, UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Home() {
  // Déconnexion automatique des pages sécurisées
  useEffect(() => {
    // Supprimer les sessions d'authentification des pages sécurisées
    sessionStorage.removeItem('depart_authenticated');
    // Note: L'admin n'utilise pas sessionStorage, donc pas besoin de le nettoyer
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background avec overlay moderne */}
      <div className="absolute inset-0">
        <Image 
          src="/images/background.jpg" 
          alt="background" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-purple-900/20" />
      </div>

      {/* Bouton Admin amélioré */}
      <div className="absolute top-6 right-6 z-20">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            href="/admin" 
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-white/30 rounded-full text-white hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Shield className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" />
            <span className="text-sm font-semibold">Administration</span>
          </Link>
        </motion.div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        
        {/* Titre principal */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Registre des
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Visiteurs
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Gestion des <span className="text-green-400 font-semibold">entrées</span> et <span className="text-red-400 font-semibold">sorties</span> pour la sécurité de vos locaux
          </p>
        </div>

        {/* Carte principale moderne */}
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            
            {/* Logo avec effet moderne */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-30" />
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                  <Image 
                    src="/images/logo.png" 
                    alt="logo" 
                    width={120} 
                    height={120}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'action modernes */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Link 
                  href="/arrivee" 
                  className="group w-full flex items-center justify-center sm:justify-between px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Arrivée
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200 hidden sm:block" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Link 
                  href="/depart" 
                  className="group w-full flex items-center justify-center sm:justify-between px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    Départ
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200 hidden sm:block" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Fonctionnalités avec icônes */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 max-w-2xl">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Shield className="w-4 h-4" />
            <span>Sécurisé</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Clock className="w-4 h-4" />
            <span>Temps réel</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Users className="w-4 h-4" />
            <span>Multi-utilisateurs</span>
          </div>
        </div>
      </div>

      {/* Footer moderne */}
      <footer className="absolute bottom-0 left-0 right-0 p-6">
        <div className="text-center">
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Registre des visiteurs. Tous droits réservés. Fait par CHghosts
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
