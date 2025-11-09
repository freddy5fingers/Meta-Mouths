// Fix: Add missing import for React to resolve namespace errors.
import React from 'react';

export interface Persona {
  id: string;
  name: string;
  icon: string;
  systemInstruction: string;
  voiceInstruction: string;
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  // Styling
  bubbleColor: string;
  borderColor: string;
  nameColor: string;
  ringColor: string;
}

export interface Message {
  id: string;
  personaId: string;
  text: string;
}
