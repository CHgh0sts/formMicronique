import React from 'react';

// Définition locale du type QuestionType
type QuestionType = 'TEXT' | 'EMAIL' | 'TEL' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'NUMBER' | 'DATE';

interface Question {
  id: string;
  titre: string;
  type: QuestionType;
  options?: string | null;
  placeholder?: string | null;
  required: boolean;
}

interface DynamicQuestionProps {
  question: Question;
  value: string;
  onChange: (questionId: string, value: string) => void;
}

export default function DynamicQuestion({ question, value, onChange }: DynamicQuestionProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(question.id, e.target.value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentValues = value ? value.split(',') : [];
    const optionValue = e.target.value;
    
    if (e.target.checked) {
      currentValues.push(optionValue);
    } else {
      const index = currentValues.indexOf(optionValue);
      if (index > -1) {
        currentValues.splice(index, 1);
      }
    }
    
    onChange(question.id, currentValues.join(','));
  };

  const baseInputClasses = "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 text-sm";

  // Options peuvent être stockées en JSON (tableau ou chaîne) ou en chaîne comma-separated
  const getOptionsArray = (): string[] => {
    if (!question.options) return [];
    try {
      const parsed = JSON.parse(question.options);
      if (Array.isArray(parsed)) return parsed.filter((o): o is string => typeof o === 'string');
      if (typeof parsed === 'string') return parsed.split(',').map((s) => s.trim()).filter(Boolean);
    } catch {
      // Stockage en "opt1,opt2,opt3" sans JSON
      return String(question.options).split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={question.placeholder || question.titre}
            required={question.required}
            className={baseInputClasses}
            aria-label={question.titre}
          />
        );

      case 'EMAIL':
        return (
          <input
            type="email"
            value={value}
            onChange={handleChange}
            placeholder={question.placeholder || 'votre@email.com'}
            required={question.required}
            className={baseInputClasses}
            aria-label={question.titre}
          />
        );

      case 'TEL':
        return (
          <input
            type="tel"
            value={value}
            onChange={handleChange}
            placeholder={question.placeholder || '06 12 34 56 78'}
            required={question.required}
            className={baseInputClasses}
            aria-label={question.titre}
          />
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            value={value}
            onChange={handleChange}
            placeholder={question.placeholder || question.titre}
            required={question.required}
            className={baseInputClasses}
            aria-label={question.titre}
          />
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={handleChange}
            required={question.required}
            className={baseInputClasses}
            aria-label={question.titre}
          />
        );

      case 'TEXTAREA':
        return (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={question.placeholder || question.titre}
            required={question.required}
            rows={3}
            className={`${baseInputClasses} resize-none`}
            aria-label={question.titre}
          />
        );

      case 'SELECT':
        const selectOptions = getOptionsArray();
        return (
          <select
            value={value}
            onChange={handleChange}
            required={question.required}
            className={baseInputClasses}
            aria-label={question.titre}
          >
            <option value="">Sélectionnez une option</option>
            {selectOptions.map((option: string, index: number) => (
              <option key={index} value={option} className="bg-gray-800 text-white">
                {option}
              </option>
            ))}
          </select>
        );

      case 'RADIO':
        const radioOptions = getOptionsArray();
        return (
          <div className="space-y-2" role="radiogroup" aria-label={question.titre}>
            {radioOptions.map((option: string, index: number) => (
              <label key={index} className="flex items-center gap-2 text-white/90 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={handleChange}
                  required={question.required}
                  className="w-4 h-4 text-green-400 bg-white/10 border-white/20 focus:ring-green-400 focus:ring-2"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'CHECKBOX':
        const checkboxOptions = getOptionsArray();
        const selectedValues = value ? value.split(',').map((s) => s.trim()) : [];

        // Si des options sont définies, on affiche une case par option
        return checkboxOptions.length > 0 ? (
          <div className="space-y-2" role="group" aria-label={question.titre}>
            {checkboxOptions.map((option: string, index: number) => (
              <label key={index} className="flex items-center gap-2 text-white/90 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-green-400 bg-white/10 border-white/20 focus:ring-green-400 focus:ring-2 rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        ) : (
          // Sinon, on rend un toggle custom (comme dans le formulaire admin)
          <button
            type="button"
            onClick={() => onChange(question.id, value === 'true' ? '' : 'true')}
            aria-pressed={value === 'true'}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              value === 'true'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-white/20'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                value === 'true' ? 'translate-x-[16px]' : 'translate-x-1'
              }`}
            />
          </button>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={question.placeholder || question.titre}
            required={question.required}
            className={baseInputClasses}
            aria-label={question.titre}
          />
        );
    }
  };

  const checkboxOptions = question.type === 'CHECKBOX' ? getOptionsArray() : [];
  const isBooleanCheckbox = question.type === 'CHECKBOX' && checkboxOptions.length === 0;

  if (isBooleanCheckbox) {
    // Rendu spécifique : nom de la question + ligne pointillée + toggle booléen à droite
    return (
      <div className="flex items-center text-white/90 text-xs font-medium cursor-pointer">
        <span>
          {question.titre}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </span>
        <span className="flex-1 mx-2 border-t border-dashed border-white/25" />
        {renderQuestion()}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-white/90 text-xs font-medium">
        {question.titre}
        {question.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {renderQuestion()}
    </div>
  );
} 