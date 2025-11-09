import React from 'react';
import { Message as MessageType, Persona } from '../types';

interface MessageProps {
  message: MessageType;
  persona: Persona;
  align: 'left' | 'right';
  isSpeaking: boolean;
  style?: React.CSSProperties;
}

export const Message: React.FC<MessageProps> = ({ message, persona, align, isSpeaking, style }) => {
  const { name, icon, bubbleColor, borderColor, nameColor, ringColor } = persona;

  const messageClasses = `flex items-start gap-3 md:gap-4 max-w-[85%] md:max-w-xl ${align === 'left' ? 'self-start' : 'self-end'}`;
  
  const animatedBubbleClasses = `px-4 py-3 rounded-2xl text-gray-200 ${bubbleColor} animate-dynamic-fade-in`;

  const iconContainerClasses = `flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-2xl ${bubbleColor} border-2 ${borderColor} transition-all duration-300 ${isSpeaking ? `ring-4 ring-offset-2 ring-offset-gray-900 ${ringColor}` : ''}`;

  if (align === 'left') {
    return (
      <div className={`flex items-start gap-3 md:gap-4 max-w-[85%] md:max-w-xl ${align === 'left' ? '' : 'ml-auto'}`}>
        <div className={iconContainerClasses}>
          <img src={icon} alt={name} className="w-full h-full rounded-full object-cover" />
        </div>
        <div className="flex-grow">
          <p className={`text-sm font-semibold mb-1 ${nameColor}`}>{name}</p>
          <div className={`${animatedBubbleClasses} rounded-bl-md`} style={style}>
            <p className="leading-relaxed">{message.text}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 md:gap-4 max-w-[85%] md:max-w-xl ml-auto`}>
      <div className="flex-grow text-right">
        <p className={`text-sm font-semibold mb-1 ${nameColor}`}>{name}</p>
        <div className={`${animatedBubbleClasses} inline-block text-left rounded-br-md`} style={style}>
          <p className="leading-relaxed">{message.text}</p>
        </div>
      </div>
      <div className={iconContainerClasses}>
        <img src={icon} alt={name} className="w-full h-full rounded-full object-cover" />
      </div>
    </div>
  );
};
