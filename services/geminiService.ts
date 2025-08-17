import { type ChatMessage, Role, type AiResponse, type QuestionWithOptions } from '../types';
import { supabase } from './supabaseClient'; // Import our Supabase client
import { SYSTEM_PROMPT, SUMMARIZATION_PROMPT, SUMMARIZATION_THRESHOLD, WITTY_PROMPT_SYSTEM_INSTRUCTION } from '../constants';

// --- DEPRECATED/REMOVED DIRECT GOOGLE AI INTEGRATION ---
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// const textModel = 'gemini-2.5-flash';
// const summarizeConversation = async (historyToSummarize: ChatMessage[]): Promise<string> => { /* ... */ };
// const buildApiRequest = async (history: ChatMessage[]): Promise<GenerateContentParameters> => { /* ... */ };
// ---------------------------------------------------------

// Regular expression to identify clarifying questions with numbered options.
const clarifyingQuestionRegex = /^\s*\d+\)/m;

/**
 * Fetches witty, topic-relevant loading messages from the AI.
 * (Currently simplified as direct AI call is moved to backend)
 */
export const getWittyLoadingMessages = async (topic: string): Promise<string[]> => {
    // For now, return static messages or an empty array.
    // If witty messages are needed from AI, this logic should also call a secure backend function.
    console.log("Witty loading messages feature currently simplified. Topic:", topic);
    return [
        "Consulting the digital oracle...",
        "Crunching numbers and dreams...",
        "Optimizing pixels and profits...",
        "Unleashing the algorithms of success..."
    ];
};

/**
 * Parses clarifying questions from the AI's text response.
 * NOTE: This logic might ideally live on the Edge Function if the AI consistently returns a specific format.
 * For now, keeping it here as the Edge Function is designed to return the raw AI text.
 * @param aiText The raw text from the AI.
 * @returns An object containing the preamble text and an array of questions.
 */
const parseClarifyingQuestions = (aiText: string): { text: string; questions: QuestionWithOptions[] } => {
    const questions: QuestionWithOptions[] = [];
    let preambleText = '';
    const lines = aiText.split('\n').filter(Boolean);
    let i = 0;

    // Find the start of the first actual question block
    let firstQuestionIndex = -1;
    for (let j = 0; j < lines.length; j++) {
        const isQuestionLine = !clarifyingQuestionRegex.test(lines[j]);
        const isNextLineAnOption = j + 1 < lines.length && clarifyingQuestionRegex.test(lines[j + 1]);
        if (isQuestionLine && isNextLineAnOption) {
            firstQuestionIndex = j;
            break;
        }
    }
    
    // If no question block is found, treat the whole thing as text
    if (firstQuestionIndex === -1) {
        return { text: aiText, questions: [] };
    }
    
    // Everything before the first question is preamble
    preambleText = lines.slice(0, firstQuestionIndex).join('\n');
    i = firstQuestionIndex;

    // Now, parse the questions and options
    while (i < lines.length) {
        const questionLine = lines[i];
        if (clarifyingQuestionRegex.test(questionLine)) {
            i++; // Skip stray option lines
            continue;
        }

        const currentQuestion: QuestionWithOptions = { question: questionLine, options: [] };
        i++;

        // Collect all subsequent option lines for this question
        while (i < lines.length && clarifyingQuestionRegex.test(lines[i])) {
            currentQuestion.options.push(lines[i].replace(/^\s*\d+\)\s*/, ''));
            i++;
        }
        
        if (currentQuestion.options.length > 0) {
            questions.push(currentQuestion);
        }
    }
    
    return { text: preambleText.trim(), questions };
};


/**
 * Sends the conversation to the Gemini API via the Supabase Edge Function and gets a response.
 */
export const getAiResponse = async (history: ChatMessage[]): Promise<AiResponse> => {
    try {
        // Call the deployed Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('gemini-proxy', {
            body: { history }, // Send the chat history to the Edge Function
        });

        if (error) {
            console.error("Error invoking Edge Function:", error);
            throw new Error(error.message);
        }

        // The Edge Function is designed to return the raw AI text response.
        // We then parse it on the frontend, similar to the original logic.
        const aiText = (data as { text: string }).text.trim();
        
        const planStartIndex = aiText.search(/^Business Plan:/im);

        if (planStartIndex !== -1) {
            // This is a final plan.
            let conversationalText = '';
            let planText = aiText;

            if (planStartIndex > 0) {
                conversationalText = aiText.substring(0, planStartIndex).trim();
                planText = aiText.substring(planStartIndex).trim();
            }
            
            return {
                text: conversationalText,
                planContent: planText,
                questions: [],
            };
        }
        
        // This is a response with clarifying questions or a simple text answer.
        const { text, questions } = parseClarifyingQuestions(aiText);

        return {
            text: text,
            questions: questions,
        };

    } catch (error) {
        console.error("Error fetching AI response via Edge Function:", error);
        return {
            text: "Sorry, I encountered an error. Please try again.",
            questions: [],
        };
    }
};