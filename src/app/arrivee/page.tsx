'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Building, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DynamicQuestion from '@/components/DynamicQuestion';
import CameraTest from '@/components/CameraTest';

// Utiliser le même type que dans DynamicQuestion
type QuestionType = 'TEXT' | 'EMAIL' | 'TEL' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'NUMBER' | 'DATE';

interface Question {
  id: string;
  titre: string;
  type: QuestionType;
  options?: string | null;
  placeholder?: string | null;
  required: boolean;
}

export default function ArriveePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    societe: ''
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [customResponses, setCustomResponses] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recognizedUser, setRecognizedUser] = useState<any>(null);
  const [shouldCaptureFace, setShouldCaptureFace] = useState(false);

  useEffect(() => {
    // Mettre à jour l'heure côté client
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
    };
    
    updateTime(); // Première mise à jour
    const interval = setInterval(updateTime, 1000); // Mise à jour chaque seconde
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Charger les questions personnalisées
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        if (response.ok) {
          const questionsData = await response.json();
          setQuestions(questionsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Si un utilisateur est reconnu, utiliser ses données
      const userData = recognizedUser ? {
        nom: recognizedUser.nom,
        prenom: recognizedUser.prenom,
        societe: recognizedUser.societe,
        reponses: Object.entries(customResponses).map(([questionId, response]) => ({
          [questionId]: response
        }))
      } : {
        ...formData,
        reponses: Object.entries(customResponses).map(([questionId, response]) => ({
          [questionId]: response
        }))
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await response.json();
        
        // Déclencher la capture du visage pour sauvegarder l'embedding
        if (!recognizedUser) {
          setShouldCaptureFace(true);
          // Attendre un peu pour que la capture se fasse
          setTimeout(async () => {
            try {
              // Ici on pourrait capturer l'embedding depuis le composant de reconnaissance
              console.log('Utilisateur créé, embedding à capturer pour:', newUser.id);
            } catch (error) {
              console.error('Erreur lors de la capture de l\'embedding:', error);
            }
            setShouldCaptureFace(false);
          }, 1000);
        }

        toast.success('Arrivée enregistrée avec succès !', {
          description: `Bienvenue ${userData.prenom} ${userData.nom}`,
          duration: 3000,
        });
        
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prenom: '',
          societe: ''
        });
        setCustomResponses({});
        setRecognizedUser(null);
        
        // Redirection automatique après 2 secondes
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error('Erreur lors de l\'enregistrement', {
          description: errorData.error || 'Une erreur est survenue',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter le serveur',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCustomQuestionChange = (questionId: string, value: string) => {
    setCustomResponses({
      ...customResponses,
      [questionId]: value
    });
  };

  const handleFaceRecognized = (result: any) => {
    if (result.recognized && result.user) {
      setRecognizedUser(result.user);
      // Pré-remplir le formulaire avec les données reconnues
      setFormData({
        nom: result.user.nom,
        prenom: result.user.prenom,
        societe: result.user.societe || ''
      });
      
      toast.success('Utilisateur reconnu !', {
        description: `Bonjour ${result.user.prenom} ${result.user.nom}`,
        duration: 3000,
      });
    } else {
      setRecognizedUser(null);
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-green-900/20" />
      </div>

      {/* Header avec bouton retour - position absolue */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
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

      {/* Contenu principal centré */}
      <div className="relative z-10 h-screen flex items-center justify-center p-4">
        
        {/* Container centré avec titre et formulaire */}
        <div className="w-full max-w-lg flex flex-col items-center">
          
          {/* Titre */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Arrivée
              </span>
            </h1>
            <p className="text-base text-white/80">
              Enregistrez votre arrivée dans nos locaux
            </p>
            {recognizedUser && (
              <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm">
                  ✓ Utilisateur reconnu : {recognizedUser.prenom} {recognizedUser.nom}
                </p>
              </div>
            )}
          </div>

          {/* Box du formulaire */}
          <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl max-h-[70vh] flex flex-col">

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Champs obligatoires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-white/90 text-xs font-medium flex items-center gap-2">
                      <User className="w-3 h-3" />
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      readOnly={!!recognizedUser}
                      className={`w-full px-3 py-2 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 text-sm ${
                        recognizedUser ? 'bg-green-500/20 cursor-not-allowed' : 'bg-white/10'
                      }`}
                      placeholder="Votre nom"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/90 text-xs font-medium flex items-center gap-2">
                      <User className="w-3 h-3" />
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      readOnly={!!recognizedUser}
                      className={`w-full px-3 py-2 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 text-sm ${
                        recognizedUser ? 'bg-green-500/20 cursor-not-allowed' : 'bg-white/10'
                      }`}
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-white/90 text-xs font-medium flex items-center gap-2">
                    <Building className="w-3 h-3" />
                    Société *
                  </label>
                  <input
                    type="text"
                    name="societe"
                    value={formData.societe}
                    onChange={handleChange}
                    required
                    readOnly={!!recognizedUser}
                    className={`w-full px-3 py-2 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 text-sm ${
                      recognizedUser ? 'bg-green-500/20 cursor-not-allowed' : 'bg-white/10'
                    }`}
                    placeholder="Nom de votre société"
                  />
                </div>

                {/* Questions personnalisées */}
                {questions.map((question) => (
                  <DynamicQuestion
                    key={question.id}
                    question={question}
                    value={customResponses[question.id] || ''}
                    onChange={handleCustomQuestionChange}
                  />
                ))}

                {/* Bouton de soumission */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className={`w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 text-sm ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <User className="w-4 h-4" />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer l\'arrivée'}
                </motion.button>
              </form>
            </div>
          </div>

          {/* Note RGPD */}
          <div className="mt-4 text-center">
            <p className="text-white/60 text-xs leading-relaxed max-w-md">
              Nous collectons vos données dans le cadre de la gestion des visiteurs, de la sécurité du personnel, 
              en cas d'incidents et d'autres raisons liées à la sûreté de nos locaux. Ces données seront conservées 
              pendant une durée de 1 an, puis supprimées après ce délai. Conformément au RGPD, vous pouvez à tout 
              moment exercer vos droits relatifs à la protection de vos données personnelles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 