import React, { useState } from 'react';
import { PERSONAS, SUGGESTED_TOPICS } from '../constants';
import { Persona } from '../types';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { AgeConfirmationModal } from './AgeConfirmationModal';

interface SetupViewProps {
  onStartBanter: (topic: string, personas: [Persona, Persona]) => void;
  onStartRoast: (personas: [Persona, Persona]) => void;
  onStartVulgarRoast: (personas: [Persona, Persona]) => void;
}

const exampleTopics = [
    SUGGESTED_TOPICS[0],
    SUGGESTED_TOPICS[1],
    SUGGESTED_TOPICS[3],
];

export const SetupView: React.FC<SetupViewProps> = ({ onStartBanter, onStartRoast, onStartVulgarRoast }) => {
  const [selected, setSelected] = useState<Persona[]>([]);
  const [topic, setTopic] = useState('');
  const [lastSuggestedIndex, setLastSuggestedIndex] = useState<number | null>(null);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);

  const handleSelect = (persona: Persona) => {
    setSelected(prev => {
      if (prev.find(p => p.id === persona.id)) {
        return prev.filter(p => p.id !== persona.id);
      }
      if (prev.length < 2) {
        return [...prev, persona];
      }
      // If 2 are already selected, replace the last one
      return [prev[0], persona];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && selected.length === 2) {
      onStartBanter(topic, selected as [Persona, Persona]);
    }
  };

  const handleSuggestTopic = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * SUGGESTED_TOPICS.length);
    } while (SUGGESTED_TOPICS.length > 1 && randomIndex === lastSuggestedIndex);
    
    setLastSuggestedIndex(randomIndex);
    setTopic(SUGGESTED_TOPICS[randomIndex]);
  };

  const handleExampleClick = (exampleTopic: string) => {
    setTopic(exampleTopic);
  }

  const handleRoastClick = () => {
    if (selected.length === 2) {
      onStartRoast(selected as [Persona, Persona]);
    }
  };

  const handleVulgarRoastClick = () => {
    if (selected.length === 2) {
      setIsAgeModalOpen(true);
    }
  };
  
  const handleConfirmVulgarRoast = () => {
    if (selected.length === 2) {
      onStartVulgarRoast(selected as [Persona, Persona]);
    }
    setIsAgeModalOpen(false);
  };


  const isSelected = (persona: Persona) => selected.some(p => p.id === persona.id);
  const canStartBanter = selected.length === 2 && topic.trim().length > 0;
  const canRoast = selected.length === 2;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 animate-dynamic-fade-in space-y-8 overflow-y-auto min-h-0 pb-6 pr-4">
        <section className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-4 sm:p-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-200">1. Choose Two Combatants</h2>
                <p className="text-gray-400 mt-1">Select two personalities to debate.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {PERSONAS.map(persona => {
                    return (
                        <button 
                            key={persona.id}
                            onClick={() => handleSelect(persona)}
                            className={`p-4 aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transform hover:scale-105 transition-all duration-200 text-center ${isSelected(persona) ? `${persona.borderColor} ${persona.bubbleColor} ring-4 ${persona.ringColor}` : 'bg-gray-800/60 border-gray-700 hover:border-gray-500'}`}
                        >
                            <img src={persona.icon} alt={persona.name} className="w-20 h-20 rounded-full object-cover" />
                            <span className="text-sm font-semibold">{persona.name}</span>
                        </button>
                    )
                })}
            </div>
        </section>

        <section className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-4 sm:p-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-200">2. Pick a Topic or Start a Roast</h2>
                <p className="text-gray-400 mt-1">What should they argue about? Or just have them go at it.</p>
            </div>
        
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl mx-auto">
                <div className="relative w-full">
                    <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic for a banter..."
                    className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    />
                    <button
                    type="button"
                    onClick={handleSuggestTopic}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-r-xl"
                    aria-label="Suggest a topic"
                    >
                    <LightbulbIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                    {exampleTopics.map(topic => (
                        <button 
                            key={topic}
                            type="button"
                            onClick={() => handleExampleClick(topic)}
                            className="px-3 py-1.5 text-sm bg-gray-700/50 border border-gray-600 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {topic}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                      type="submit"
                      disabled={!canStartBanter}
                      className="w-full sm:w-auto flex-1 px-5 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl hover:from-purple-700 hover:to-cyan-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                      Start Banter
                  </button>
                   <button
                        type="button"
                        onClick={handleRoastClick}
                        disabled={!canRoast}
                        className="w-full sm:w-auto flex-1 px-5 py-3 font-semibold text-white bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-red-700 hover:to-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🔥 Instant Roast
                    </button>
                     <button
                        type="button"
                        onClick={handleVulgarRoastClick}
                        disabled={!canRoast}
                        className="w-full sm:w-auto flex-1 px-5 py-3 font-semibold text-white bg-gradient-to-r from-gray-800 to-black rounded-xl border border-red-600 hover:from-red-900 hover:to-black transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-red-500 font-extrabold mr-1">18+</span> Vulgar Roast
                    </button>
                </div>
            </form>
        </section>
        <AgeConfirmationModal 
          isOpen={isAgeModalOpen}
          onConfirm={handleConfirmVulgarRoast}
          onCancel={() => setIsAgeModalOpen(false)}
        />
    </div>
  );
};