
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { ConversationView } from './components/ConversationView';
import { SetupView } from './components/SetupView';
import { generateBanterResponse, generateSpeech } from './services/geminiService';
import { Message, Persona } from './types';
import { MAX_TURNS, PERSONAS } from './constants';
import { SpeakerOnIcon } from './components/icons/SpeakerOnIcon';
import { SpeakerOffIcon } from './components/icons/SpeakerOffIcon';
import { LightningIcon } from './components/icons/LightningIcon';

// Audio decoding utilities from @google/genai documentation
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const App: React.FC = () => {
  const [view, setView] = useState<'setup' | 'bantering'>('setup');
  const [topic, setTopic] = useState<string>('');
  const [selectedPersonas, setSelectedPersonas] = useState<[Persona, Persona] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRoasting, setIsRoasting] = useState<boolean>(false);
  const stopGenerationRef = useRef<boolean>(false);

  // Interrupter State
  const [interrupter, setInterrupter] = useState<Persona | null>(null);
  const [hasInterrupted, setHasInterrupted] = useState<boolean>(false);
  
  // Speech Synthesis State
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);
  const [currentlySpeakingMessageId, setCurrentlySpeakingMessageId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<{ buffer: AudioBuffer; id: string }[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const personasById = useMemo(() => 
    PERSONAS.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, Persona>), 
  []);

  const playNextInQueue = useCallback(() => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || !isSpeechEnabled) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioContext = audioContextRef.current;
    
    isPlayingRef.current = true;
    const { buffer, id } = audioQueueRef.current.shift()!;
    setCurrentlySpeakingMessageId(id);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    
    source.onended = () => {
      isPlayingRef.current = false;
      currentSourceRef.current = null;
      setCurrentlySpeakingMessageId(null);
      playNextInQueue(); // Play next item
    };

    currentSourceRef.current = source;
    source.start();
  }, [isSpeechEnabled]);

  const addAudioToQueue = useCallback(async (base64Audio: string, messageId: string) => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioContext = audioContextRef.current;
    
    try {
        const decodedBuffer = decode(base64Audio);
        const buffer = await decodeAudioData(decodedBuffer, audioContext, 24000, 1);
        audioQueueRef.current.push({ buffer, id: messageId });
        playNextInQueue();
    } catch (e) {
        console.error("Failed to decode or play audio", e);
    }
  }, [playNextInQueue]);


  const handleStartBanter = useCallback(async (topic: string, personas: [Persona, Persona]) => {
    if (!topic.trim()) return;

    setTopic(topic);
    setSelectedPersonas(personas);
    setMessages([]);
    setError(null);
    setView('bantering');
    setIsLoading(true);
    setIsPaused(false);
    setIsRoasting(false);
    setHasInterrupted(false);
    setInterrupter(null);
    stopGenerationRef.current = false;

    let currentMessages: Message[] = [];
    const [personaA, personaB] = personas;

    for (let i = 0; i < MAX_TURNS; i++) {
      if (stopGenerationRef.current) break;
      const nextPersona = i % 2 === 0 ? personaA : personaB;
      try {
        const responseText = await generateBanterResponse(topic, currentMessages, nextPersona, personasById, false, false);
        if (stopGenerationRef.current) break;

        const newMessage: Message = {
          id: `${Date.now()}-${i}`,
          personaId: nextPersona.id,
          text: responseText,
        };
        currentMessages = [...currentMessages, newMessage];
        setMessages([...currentMessages]);

        if (isSpeechEnabled) {
          try {
            const audioData = await generateSpeech(responseText, nextPersona);
            if (stopGenerationRef.current) break;
            if (audioData) {
              addAudioToQueue(audioData, newMessage.id);
            }
          } catch(speechError) {
            console.error("Failed to generate speech:", speechError);
          }
        }

      } catch (e) {
        console.error(e);
        setError('An error occurred during the banter. Please check your API key and try again.');
        break; 
      }
    }

    setIsLoading(false);
  }, [isSpeechEnabled, addAudioToQueue, personasById]);

  const handleStartRoast = useCallback(async () => {
    if (!selectedPersonas) return;

    setIsLoading(true);
    setIsPaused(false);
    setIsRoasting(true);
    stopGenerationRef.current = false;

    let currentMessages = [...messages];
    const [personaA, personaB] = selectedPersonas;
    const ROAST_TURNS = 6; // 3 turns each

    for (let i = 0; i < ROAST_TURNS; i++) {
      if (stopGenerationRef.current) break;
      const lastMessage = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1] : null;
      const nextPersona = !lastMessage || lastMessage.personaId === personaB.id ? personaA : personaB;

      try {
        const responseText = await generateBanterResponse(topic, currentMessages, nextPersona, personasById, true, false);
        if (stopGenerationRef.current) break;

        const newMessage: Message = {
          id: `roast-${Date.now()}-${i}`,
          personaId: nextPersona.id,
          text: responseText,
        };
        currentMessages = [...currentMessages, newMessage];
        setMessages([...currentMessages]);

        if (isSpeechEnabled) {
          try {
            const audioData = await generateSpeech(responseText, nextPersona);
            if (stopGenerationRef.current) break;
            if (audioData) {
              addAudioToQueue(audioData, newMessage.id);
            }
          } catch(speechError) {
            console.error("Failed to generate speech:", speechError);
          }
        }

      } catch (e) {
        console.error(e);
        setError('An error occurred during the roast. Please try again.');
        break; 
      }
    }
    setIsLoading(false);

  }, [messages, selectedPersonas, topic, personasById, isSpeechEnabled, addAudioToQueue]);
  
  const handleDirectRoast = useCallback(async (personas: [Persona, Persona]) => {
    setTopic('A no-holds-barred roast battle');
    setSelectedPersonas(personas);
    setMessages([]);
    setError(null);
    setView('bantering');
    setIsLoading(true);
    setIsPaused(false);
    setIsRoasting(true);
    stopGenerationRef.current = false;

    let currentMessages: Message[] = [];
    const [personaA, personaB] = personas;
    const ROAST_TURNS = 6; // 3 turns each

    for (let i = 0; i < ROAST_TURNS; i++) {
      if (stopGenerationRef.current) break;
      const lastMessage = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1] : null;
      const nextPersona = !lastMessage || lastMessage.personaId === personaB.id ? personaA : personaB;

      try {
        const responseText = await generateBanterResponse("Roast Battle", currentMessages, nextPersona, personasById, true, false); 
        if (stopGenerationRef.current) break;

        const newMessage: Message = {
          id: `roast-${Date.now()}-${i}`,
          personaId: nextPersona.id,
          text: responseText,
        };
        currentMessages = [...currentMessages, newMessage];
        setMessages([...currentMessages]);

        if (isSpeechEnabled) {
          try {
            const audioData = await generateSpeech(responseText, nextPersona);
            if (stopGenerationRef.current) break;
            if (audioData) {
              addAudioToQueue(audioData, newMessage.id);
            }
          } catch(speechError) {
            console.error("Failed to generate speech:", speechError);
          }
        }

      } catch (e) {
        console.error(e);
        setError('An error occurred during the roast. Please try again.');
        break; 
      }
    }
    setIsLoading(false);
  }, [personasById, isSpeechEnabled, addAudioToQueue]);

  const handleStartVulgarRoast = useCallback(async (personas: [Persona, Persona]) => {
    setTopic('An 18+ no-holds-barred vulgar roast battle');
    setSelectedPersonas(personas);
    setMessages([]);
    setError(null);
    setView('bantering');
    setIsLoading(true);
    setIsPaused(false);
    setIsRoasting(true);
    stopGenerationRef.current = false;

    let currentMessages: Message[] = [];
    const [personaA, personaB] = personas;
    const ROAST_TURNS = 6;

    for (let i = 0; i < ROAST_TURNS; i++) {
      if (stopGenerationRef.current) break;
      const lastMessage = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1] : null;
      const nextPersona = !lastMessage || lastMessage.personaId === personaB.id ? personaA : personaB;

      try {
        const responseText = await generateBanterResponse(
            "18+ Vulgar Roast", 
            currentMessages, 
            nextPersona, 
            personasById, 
            true, // isRoasting
            true  // isVulgarRoast
        );
        if (stopGenerationRef.current) break;

        const newMessage: Message = {
          id: `vulgar-roast-${Date.now()}-${i}`,
          personaId: nextPersona.id,
          text: responseText,
        };
        currentMessages = [...currentMessages, newMessage];
        setMessages([...currentMessages]);

        if (isSpeechEnabled) {
          try {
            const audioData = await generateSpeech(responseText, nextPersona);
            if (stopGenerationRef.current) break;
            if (audioData) {
              addAudioToQueue(audioData, newMessage.id);
            }
          } catch(speechError) {
            console.error("Failed to generate speech:", speechError);
          }
        }
      } catch (e) {
        console.error(e);
        setError('An error occurred during the roast. Please try again.');
        break;
      }
    }
    setIsLoading(false);
  }, [personasById, isSpeechEnabled, addAudioToQueue]);

  const handleInterrupt = useCallback(async () => {
    if (!selectedPersonas) return;

    setIsLoading(true);
    setIsPaused(false);
    setHasInterrupted(true);
    stopGenerationRef.current = false;

    const availablePersonas = PERSONAS.filter(p => 
        p.id !== selectedPersonas[0].id && p.id !== selectedPersonas[1].id
    );
    if (availablePersonas.length === 0) {
        setError("No other personas available to interrupt.");
        setIsLoading(false);
        return;
    }
    const randomInterrupter = availablePersonas[Math.floor(Math.random() * availablePersonas.length)];
    setInterrupter(randomInterrupter);
    
    let currentMessages = [...messages];
    const combatants = [...selectedPersonas, randomInterrupter];
    
    // Generate interruption message
    try {
        const responseText = await generateBanterResponse(topic, currentMessages, randomInterrupter, personasById, false, false, true);
        if (stopGenerationRef.current) {
            setIsLoading(false);
            return;
        }
        const newMessage: Message = {
            id: `interrupt-${Date.now()}-0`,
            personaId: randomInterrupter.id,
            text: responseText,
        };
        currentMessages = [...currentMessages, newMessage];
        setMessages([...currentMessages]);

        if (isSpeechEnabled) {
            try {
                const audioData = await generateSpeech(responseText, randomInterrupter);
                if (stopGenerationRef.current) {
                  setIsLoading(false);
                  return;
                }
                if (audioData) addAudioToQueue(audioData, newMessage.id);
            } catch(speechError) {
                console.error("Failed to generate speech for interruption:", speechError);
            }
        }
    } catch (e) {
        console.error(e);
        setError('An error occurred during the interruption. Please try again.');
        setIsLoading(false);
        return;
    }

    // Continue conversation with 3 people for 6 more turns
    const INTERRUPT_TURNS = 6;
    for (let i = 0; i < INTERRUPT_TURNS; i++) {
        if (stopGenerationRef.current) break;
        
        const lastSpeakerId = currentMessages[currentMessages.length - 1].personaId;
        const lastSpeakerIndex = combatants.findIndex(p => p.id === lastSpeakerId);
        const nextSpeakerIndex = (lastSpeakerIndex + 1) % 3;
        const nextPersona = combatants[nextSpeakerIndex];

        try {
            const responseText = await generateBanterResponse(topic, currentMessages, nextPersona, personasById, false, false, false);
            if (stopGenerationRef.current) break;

            const newMessage: Message = {
                id: `interrupt-${Date.now()}-${i+1}`,
                personaId: nextPersona.id,
                text: responseText,
            };
            currentMessages = [...currentMessages, newMessage];
            setMessages([...currentMessages]);

            if (isSpeechEnabled) {
                try {
                    const audioData = await generateSpeech(responseText, nextPersona);
                    if (stopGenerationRef.current) break;
                    if (audioData) addAudioToQueue(audioData, newMessage.id);
                } catch(speechError) {
                    console.error("Failed to generate speech:", speechError);
                }
            }
        } catch (e) {
            console.error(e);
            setError('An error occurred during the conversation. Please try again.');
            break;
        }
    }
    setIsLoading(false);
  }, [messages, selectedPersonas, topic, personasById, isSpeechEnabled, addAudioToQueue]);


  const stopAndClearAudio = () => {
    if (currentSourceRef.current) {
      currentSourceRef.current.onended = null; // Prevent onended callback from firing
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setCurrentlySpeakingMessageId(null);
  };

  const handleClear = () => {
    stopGenerationRef.current = true;
    setTopic('');
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsPaused(false);
    setSelectedPersonas(null);
    setView('setup');
    setIsRoasting(false);
    setInterrupter(null);
    setHasInterrupted(false);
    stopAndClearAudio();
  };
  
  const handlePause = () => {
    stopGenerationRef.current = true;
    setIsPaused(true);
    stopAndClearAudio();
    // The active generation function will check the ref and stop, then set isLoading to false.
  };

  const handleToggleSpeech = () => {
    setIsSpeechEnabled(prev => {
      const isDisabling = prev && !(!prev);
      if (isDisabling) {
        stopAndClearAudio();
      }
      return !prev;
    });
  };

  return (
    <div className="flex flex-col h-screen text-gray-100">
      <header className="p-4 border-b border-gray-800 shadow-lg bg-gray-900/60 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
         <div className="flex-1"></div> {/* Spacer */}
          <div className="text-center flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              MetaMouths
            </h1>
            <p className="text-center text-sm text-gray-400 mt-1">
              Two AIs. One Topic. Infinite Banter.
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            {view === 'bantering' && (
              <button 
                onClick={handleToggleSpeech} 
                className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label={isSpeechEnabled ? 'Disable speech' : 'Enable speech'}
              >
                {isSpeechEnabled ? <SpeakerOnIcon className="w-6 h-6" /> : <SpeakerOffIcon className="w-6 h-6" />}
              </button>
            )}
          </div>
      </header>

      <main className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden">
        {view === 'setup' ? (
           <SetupView onStartBanter={handleStartBanter} onStartRoast={handleDirectRoast} onStartVulgarRoast={handleStartVulgarRoast} />
        ) : (
          <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 min-h-0">
            <ConversationView 
                messages={messages} 
                isLoading={isLoading} 
                currentlySpeakingMessageId={currentlySpeakingMessageId}
                personasById={personasById}
                personaOrder={selectedPersonas ? (interrupter ? [selectedPersonas[0].id, selectedPersonas[1].id, interrupter.id] : [selectedPersonas[0].id, selectedPersonas[1].id]) : []}
            />
            {error && (
              <div className="my-2 p-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg text-center">
                {error}
              </div>
            )}
            <div className="mt-auto pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isLoading ? (
                  <button
                    type="button"
                    onClick={handlePause}
                    className="w-full sm:w-auto px-5 py-3 font-semibold text-white bg-yellow-600 rounded-xl hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500"
                  >
                    Pause
                  </button>
                ) : isPaused ? (
                  <>
                    <button
                        type="button"
                        onClick={handleInterrupt}
                        className="w-full sm:w-auto px-5 py-3 font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500 flex items-center justify-center gap-2"
                      >
                          <LightningIcon className="w-5 h-5" /> Interrupt!
                      </button>
                      <button
                          type="button"
                          onClick={handleClear}
                          className="w-full sm:w-auto px-5 py-3 font-semibold text-white bg-gray-600 rounded-xl hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-400"
                      >
                          Back
                      </button>
                  </>
                ) : (
                  <>
                    {view === 'bantering' && !isRoasting && messages.length >= 1 && !hasInterrupted && (
                      <button
                        type="button"
                        onClick={handleInterrupt}
                        className="w-full sm:w-auto px-5 py-3 font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500 flex items-center justify-center gap-2"
                      >
                          <LightningIcon className="w-5 h-5" /> Interrupt!
                      </button>
                    )}
                    {view === 'bantering' && !isRoasting && messages.length >= 2 && (
                          <button
                              type="button"
                              onClick={handleStartRoast}
                              className="w-full sm:w-auto px-5 py-3 font-semibold text-white bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:from-red-700 hover:to-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
                          >
                              🔥 Roast Battle
                          </button>
                      )}
                    {messages.length > 0 && (
                      <button
                          type="button"
                          onClick={handleClear}
                          className="w-full sm:w-auto px-5 py-3 font-semibold text-white bg-gray-600 rounded-xl hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-400"
                      >
                          End Conversation
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
