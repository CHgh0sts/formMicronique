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
        const selectOptions = question.options ? JSON.parse(question.options) : [];
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
        const radioOptions = question.options ? JSON.parse(question.options) : [];
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
        const checkboxOptions = question.options ? JSON.parse(question.options) : [];
        const selectedValues = value ? value.split(',') : [];
        return (
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