import { GoogleGenAI, Type } from "@google/genai";
import type { AIFeedback } from '../types';

export async function getWritingFeedback(
    requirements: string,
    prompt: string,
    studentWriting: string,
    englishLevel: string,
    apiKey: string,
    wordCount: number
): Promise<AIFeedback> {
    const ai = new GoogleGenAI({ apiKey });

    const levelCode = englishLevel.split(' ')[0]; 
    const levelIndex = ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(levelCode);

    // --- Base Schema Definition ---
    const baseSuggestionSchema = {
        type: Type.OBJECT,
        properties: {
            // STRICTER DESCRIPTION: Force exact copy
            original: { 
                type: Type.STRING, 
                description: "The EXACT substring from the student's raw text. Do NOT autocorrect. If they wrote 'First, students', you must return 'First, students'." 
            },
            changed: { type: Type.STRING, description: "The corrected version." },
            explanation: { type: Type.STRING, description: "In Vietnamese, explain why the change is needed." },
            rule_summary: { type: Type.STRING, description: "A very short, simple (A2 level) English imperative sentence (max 8 words) summarizing the rule." },
            rule_meaning_vn: { type: Type.STRING, description: "The Vietnamese translation of the 'rule_summary'." },
        },
        required: ["original", "changed", "explanation", "rule_summary", "rule_meaning_vn"],
    };

    const baseCategorySchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            score: { type: Type.INTEGER, description: "Score from 1 to 10." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "In Vietnamese." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "In Vietnamese." },
            suggestions: { type: Type.ARRAY, items: baseSuggestionSchema },
        },
        required: ["title", "score", "strengths", "weaknesses", "suggestions"],
    };

    const schema: any = {
        type: Type.OBJECT,
        properties: {
            overallScore: { type: Type.INTEGER },
            overallFeedback: { type: Type.STRING },
            categories: {
                type: Type.ARRAY,
                items: baseCategorySchema
            },
        },
        required: ["overallScore", "overallFeedback", "categories"],
    };
    
    const dynamicCategories = [
        "Writing Requirements Adherence",
        "Grammatical Range and Accuracy",
        "Lexical Resource",
        "Coherence and Cohesion",
        "Punctuation and Mechanics",
        "Collocations and Idioms"
    ];

    if (levelIndex >= 4) { 
        schema.properties.advancedEnrichment = {
            type: Type.OBJECT,
            properties: {
                grammar: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            structure: { type: Type.STRING },
                            example: { type: Type.STRING },
                        },
                        required: ["structure", "example"],
                    }
                },
                vocabulary: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            word: { type: Type.STRING },
                            definition: { type: Type.STRING },
                            example: { type: Type.STRING },
                        },
                         required: ["word", "definition", "example"],
                    }
                }
            },
            required: ["grammar", "vocabulary"],
        };
    }
    
    // --- UPDATED PROMPT WITH ANTI-HALLUCINATION RULES ---
    let fullPrompt = `You are an expert English writing coach. Analyze the following student's writing based on their stated requirements and prompt. Your feedback must be constructive, insightful, and tailored to the student's English level: ${englishLevel}.

    **1. Writing Requirements:** ${requirements}
    **2. Writing Prompt:** ${prompt}
    **3. Student's Writing:**
    ---
    ${studentWriting}
    ---

    Your task is to provide feedback in a structured JSON format. The feedback must include a detailed analysis for each of these 6 categories: ${dynamicCategories.join(', ')}.

    **CRITICAL RULES - READ CAREFULLY:**
    1. **NO FALSE POSITIVES (Crucial):** Before creating a suggestion, CHECK if the student *already* did it correctly. 
       - Example: If the student wrote "First, students..." (with a comma), DO NOT generate a suggestion telling them to add a comma.
       - Only generate a suggestion if there is an ACTUAL error or a Clear improvement needed.
    2. **Exact 'Original' Text:** The 'original' field MUST be an exact copy-paste from the student's writing. Do NOT fix typos, capitalization, or punctuation in the 'original' field.
    3. **Localization:** All 'strengths', 'weaknesses' and 'explanation' fields MUST be in Vietnamese.
    4. **Rule Summary:** Provide a 'rule_summary' (Short A2 English command) AND a 'rule_meaning_vn' (Vietnamese translation).
    5. **Word Count:** The student's writing has exactly ${wordCount} words. Strictly assess if this meets the requirement.
    6. **Collocations:** "original" = idiom; "changed" = example; "explanation" = meaning (VN); "rule_summary" = essence (EN); "rule_meaning_vn" = essence (VN).
    `;

    if (levelIndex >= 4) {
        fullPrompt += `
        - **Advanced Enrichment:** Provide advanced grammar and vocabulary in the 'advancedEnrichment' field.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: fullPrompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonStr = response.text.trim();
        const feedbackObject = JSON.parse(jsonStr);

        // --- MATH FIX: Recalculate Overall Score ---
        if (feedbackObject.categories && feedbackObject.categories.length > 0) {
            const totalPoints = feedbackObject.categories.reduce((sum: number, cat: any) => sum + cat.score, 0);
            const maxPoints = feedbackObject.categories.length * 10;
            
            // Calculate percentage and round to nearest integer
            feedbackObject.overallScore = Math.round((totalPoints / maxPoints) * 100);
        }

        return feedbackObject;
    } catch (e) {
        console.error("Error parsing Gemini response:", e);
        throw new Error("Failed to get feedback from the AI. Please try again.");
    }
}
