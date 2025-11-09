
import { GoogleGenAI, Modality } from "@google/genai";
import { Message, Persona } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function formatHistory(history: Message[], personasById: Record<string, Persona>): string {
    if (history.length === 0) {
        return "The conversation has not started yet. You will go first.";
    }
    return history.map(msg => `${personasById[msg.personaId]?.name || 'Unknown'}: ${msg.text}`).join('\n');
}

export async function generateBanterResponse(
    topic: string, 
    conversationHistory: Message[], 
    nextPersona: Persona,
    personasById: Record<string, Persona>,
    isRoasting: boolean = false,
    isVulgarRoast: boolean = false,
    isInterrupting: boolean = false,
): Promise<string> {
    const historyText = formatHistory(conversationHistory, personasById);

    const lastMessageText = conversationHistory.length > 0 
        ? `The last message was from your opponent: "${conversationHistory[conversationHistory.length - 1].text}"` 
        : "";

    const opponent = conversationHistory.length > 0 
        ? personasById[conversationHistory[conversationHistory.length - 1].personaId]
        : null;
    const opponentName = opponent ? opponent.name : "your opponent";

    let taskInstruction: string;
    let temperature = 0.9; // Default temperature

    if (isInterrupting) {
        taskInstruction = `You are dramatically interrupting an ongoing conversation. Your response IS your entrance. Make it surprising, funny, or insightful to shift the conversation's direction. Your line must be impactful and true to your character. Do not explain that you are interrupting; just say your line.`;
    } else if (isVulgarRoast) {
        temperature = 1.0; // Maximize creativity for vulgar roasts
        taskInstruction = `This is a dark, edgy, and shocking 18+ roast battle against ${opponentName}. Your response MUST BE a clever, offensive, and boundary-pushing insult. Do not hold back. Use profanity and make it personal, but keep it in the realm of brutally funny dark comedy. Do not describe what you are about to do. Just deliver the shocking roast. ${lastMessageText ? `Demolish their last statement with a comeback that's as smart as it is insulting.` : `Start the roast with a shocking insult that sets an edgy tone.`}`;
    } else if (isRoasting) {
        taskInstruction = `You are in a merciless roast battle against ${opponentName}. Your response must BE a creative, witty, and savage roast. Do not describe your actions. Just deliver the insult. ${lastMessageText ? `Demolish their last statement with a cutting comeback.` : `Start the roast battle with your best insult.`}`;
    } else {
        taskInstruction = `As ${nextPersona.name}, continue the conversation about "${topic}". Your response should flow naturally from the previous turn. Do not act like an AI or describe your task. Simply provide your character's next line. ${conversationHistory.length === 0 ? 'You are starting the conversation.' : 'You are responding to the last message.'}`;
    }

    const prompt = `
${isVulgarRoast ? `CONTEXT: 18+ VULGAR ROAST BATTLE! WARNING: EXTREMELY EXPLICIT, OFFENSIVE, AND GRAPHIC CONTENT. NO HOLDS BARRED.` : (isRoasting ? `CONTEXT: ROAST BATTLE!` : `Topic of Conversation: "${topic}"`)}

Conversation History:
${historyText}

Your Persona: ${nextPersona.name}
${taskInstruction}
`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: nextPersona.systemInstruction,
                temperature: temperature,
                topP: 0.95,
            }
        });
        
        const text = response.text;
        if (!text) {
          throw new Error("Received an empty response from the API.");
        }
        return text.trim();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate a response from the AI.");
    }
}

export async function generateSpeech(text: string, persona: Persona): Promise<string | undefined> {
    // We provide a voice instruction to make the speech sound more authentic to the persona.
    const ttsPrompt = `${persona.voiceInstruction}: "${text}"`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: ttsPrompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: persona.voice },
                    },
                },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch(error) {
        console.error("Gemini TTS Error:", error);
        throw new Error("Failed to generate speech from the AI.");
    }
}
