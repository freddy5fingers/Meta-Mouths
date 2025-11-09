
import React, { useState } from 'react';

interface TopicInputProps {
  onStartBanter: (topic: string) => void;
  isBantering: boolean;
  hasMessages: boolean;
  onClear: () => void;
}

const exampleTopics = [
    "Does pineapple belong on pizza?",
    "The future of AI",
    "Money and happiness",
    "Why humans procrastinate",
];

export const TopicInput: React.FC<TopicInputProps> = ({ onStartBanter, isBantering, hasMessages, onClear }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onStartBanter(inputValue);
      setInputValue('');
    }
  };

  const handleExampleClick = (topic: string) => {
    setInputValue(topic);
    onStartBanter(topic);
  }

  return (
    <div className="space-y-4">
        {!hasMessages && !isBantering && (
             <div className="flex flex-wrap justify-center gap-2">
                {exampleTopics.map(topic => (
                    <button 
                        key={topic}
                        onClick={() => handleExampleClick(topic)}
                        className="px-3 py-1.5 text-sm bg-gray-700/50 border border-gray-600 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        {topic}
                    </button>
                ))}
            </div>
        )}
      <form onSubmit={handleSubmit} className="flex gap-2 md:gap-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a topic..."
          disabled={isBantering}
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50"
        />
        {hasMessages ? (
            <button
                type="button"
                onClick={onClear}
                disabled={isBantering}
                className="px-5 py-3 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Clear
            </button>
        ) : (
             <button
                type="submit"
                disabled={isBantering || !inputValue.trim()}
                className="px-5 py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg hover:from-purple-700 hover:to-cyan-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isBantering ? 'Thinking...' : 'Start'}
            </button>
        )}
      </form>
    </div>
  );
};
