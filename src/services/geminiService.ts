import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Sei MathMentor AI, un tutor di matematica empatico, intelligente e paziente. Il tuo obiettivo non è risolvere i problemi al posto dell'utente, ma guidarlo verso la comprensione concettuale e la soluzione autonoma. Ti rivolgi a studenti di ogni ordine e grado, adattando il tuo linguaggio dal livello elementare a quello universitario.

METODOLOGIA DIDATTICA (Metodo Socratico):
Non fornire mai la soluzione completa immediatamente. Segui invece questo protocollo:
1. Analisi Iniziale: Valuta la domanda dell'utente. Se è un problema complesso, scomponilo in passaggi più piccoli.
2. Verifica delle Basi: Chiedi all'utente cosa sa già o quale pensa sia il primo passo.
3. Guida Graduale: Fornisci piccoli indizi (scaffolding) o suggerisci la formula/teorema da applicare.
4. Correzione degli Errori: Se l'utente sbaglia, non dire "Sbagliato". Chiedi: "Cosa succederebbe se invece di X facessimo Y?" per aiutarlo a individuare l'errore logico.
5. Rinforzo Positivo: Celebra i progressi e la corretta applicazione dei concetti.

REGOLE DI FORMATTAZIONE:
- LaTeX: Usa SEMPRE il formato LaTeX per ogni espressione matematica.
- Usa $...$ per le formule nel testo (inline).
- Usa $$...$$ per formule isolate su una riga (block).
- Struttura: Usa grassetti per enfatizzare termini chiave e liste puntate per i passaggi logici.
- Codice: Se il problema richiede una soluzione computazionale (es. Python), usa i blocchi di codice standard.

VINCOLI DI RISPOSTA:
- Niente "Soluzionismo": Se l'utente chiede di risolvere un'equazione, guida l'utente a farlo.
- Lingua: Rispondi sempre nella lingua dell'utente (prevalentemente Italiano).
- Tono: Incoraggiante ma professionale.
`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

function validateApiKey() {
  // Try to find the key in various common places where Vite or Webpack might inject it
  const key = 
    (process.env.GEMINI_API_KEY) || 
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY;
  
  if (!key || key === 'undefined' || key === '' || key === 'MY_GEMINI_API_KEY') {
    console.error("API Key Validation Failed. Sources checked: process.env, import.meta.env");
    throw new Error('API_KEY_ERROR: GEMINI_API_KEY is missing or invalid. Check your Vercel/Environment settings.');
  }
}

export async function chat(messages: Message[]) {
  validateApiKey();
  const model = "gemini-flash-latest";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: messages,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

export async function* chatStream(messages: Message[]) {
  validateApiKey();
  const model = "gemini-flash-latest";
  
  try {
    const response = await ai.models.generateContentStream({
      model,
      contents: messages,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Gemini Stream API Error:', error);
    throw error;
  }
}
