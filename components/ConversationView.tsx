
import React, { useEffect, useRef } from 'react';
import { Message as MessageType, Persona } from '../types';
import { Message } from './Message';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface ConversationViewProps {
  messages: MessageType[];
  isLoading: boolean;
  currentlySpeakingMessageId: string | null;
  personasById: Record<string, Persona>;
  personaOrder: string[];
}

export const ConversationView: React.FC<ConversationViewProps> = ({ messages, isLoading, currentlySpeakingMessageId, personasById, personaOrder }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessagesCount = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Update previous messages count after render
  useEffect(() => {
    prevMessagesCount.current = messages.length;
  });

  return (
    <div
      ref={scrollRef}
      className="flex-1 space-y-6 overflow-y-auto p-2 sm:p-4 rounded-xl bg-gray-800/50 mb-4 scroll-smooth"
    >
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-xl font-medium">Ready for a debate?</h2>
            <p>Select two personas and a topic to start.</p>
        </div>
      )}
      {messages.map((msg, index) => {
        const isNew = index >= prevMessagesCount.current;
        const staggerDelay = isNew ? (index - prevMessagesCount.current) * 150 : 0;
        const style = isNew ? { animationDelay: `${staggerDelay}ms`, opacity: 0 } : {};

        const persona = personasById[msg.personaId];
        if (!persona) return null;

        // Persona 1 is on the left, everyone else is on the right.
        const align = (personaOrder.length > 0 && msg.personaId === personaOrder[0]) ? 'left' : 'right';

        return (
          <Message 
            key={msg.id} 
            message={msg}
            persona={persona}
            align={align}
            isSpeaking={currentlySpeakingMessageId === msg.id}
            style={style}
          />
        )
      })}
      {isLoading && (
         <div className="flex justify-center items-center p-4">
            <div className="flex items-center space-x-3 text-gray-400">
                <LoadingSpinner />
                <span>AI is thinking...</span>
            </div>
        </div>
      )}
    </div>
  );
};
