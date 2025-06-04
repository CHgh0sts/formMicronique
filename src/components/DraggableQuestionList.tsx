'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Edit, Trash2, GripVertical, Settings } from 'lucide-react';

// Types
type QuestionType = 'TEXT' | 'EMAIL' | 'TEL' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'NUMBER' | 'DATE';

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

interface SortableQuestionProps {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

function SortableQuestion({ question, onEdit, onDelete }: SortableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105 shadow-2xl z-50' : 'hover:bg-white/15'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Handle de drag */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 text-white/60 hover:text-white/80 transition-colors rounded-lg hover:bg-white/10"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-white/60 text-sm">#{question.ordre}</span>
              <h3 className="text-white font-medium">{question.titre}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${
                question.active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {question.active ? 'Actif' : 'Inactif'}
              </span>
              {question.required && (
                <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-300">
                  Obligatoire
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span>Type: {question.type}</span>
              {question.placeholder && <span>Placeholder: {question.placeholder}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => onEdit(question)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => onDelete(question.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

interface DraggableQuestionListProps {
  questions: Question[];
  onQuestionsReorder: (questions: Question[]) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
}

export default function DraggableQuestionList({
  questions,
  onQuestionsReorder,
  onEditQuestion,
  onDeleteQuestion,
}: DraggableQuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over?.id);

      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      
      // Mettre à jour l'ordre des questions
      const updatedQuestions = newQuestions.map((question, index) => ({
        ...question,
        ordre: index + 1
      }));

      onQuestionsReorder(updatedQuestions);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
        <div className="text-white/60 mb-4">
          <Settings className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-medium">Aucune question configurée</p>
          <p className="text-sm">Créez votre première question personnalisée</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {questions.map((question) => (
            <SortableQuestion
              key={question.id}
              question={question}
              onEdit={onEditQuestion}
              onDelete={onDeleteQuestion}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 