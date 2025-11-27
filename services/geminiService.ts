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

    const levelCode = englishLevel.split(' ')[0]; // "B1 Intermediate" -> "B1"
    const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const levelIndex = cefrLevels.indexOf(levelCode);

    // --- Base Schema Definition ---
    const baseSuggestionSchema = {
        type: Type.OBJECT,
        properties: {
            original: { type: Type.STRING, description: "The exact phrase from the student's original text OR the idiom itself for the 'Collocations and Idioms' category." },
            changed: { type: Type.STRING, description: "The corrected version of the phrase OR an example sentence for the idiom." },
            explanation: { type: Type.STRING, description: "In Vietnamese, explain why the change is needed OR provide the idiom's meaning." },
        },
        required: ["original", "changed", "explanation"],
    };

    const baseCategorySchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            score: { type: Type.INTEGER, description: "Score from 1 to 10." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "In Vietnamese, list the strengths." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "In Vietnamese, list the weaknesses." },
            suggestions: { type: Type.ARRAY, items: baseSuggestionSchema },
        },
        required: ["title", "score", "strengths", "weaknesses", "suggestions"],
    };

    const schema: any = {
        type: Type.OBJECT,
        properties: {
            overallScore: { type: Type.INTEGER, description: "An overall score from 1 to 100." },
            overallFeedback: { type: Type.STRING, description: "A summary of the feedback." },
            categories: {
                type: Type.ARRAY,
                items: baseCategorySchema
            },
        },
        required: ["overallScore", "overallFeedback", "categories"],
    };
    
    // --- Define Categories ---
    const dynamicCategories = [
        "Writing Requirements Adherence",
        "Grammatical Range and Accuracy",
        "Lexical Resource",
        "Coherence and Cohesion",
        "Punctuation and Mechanics",
        "Collocations and Idioms"
    ];

    if (levelIndex >= 4) { // C1 and above
        schema.properties.advancedEnrichment = {
            type: Type.OBJECT,
            description: "A table of advanced grammar and vocabulary to elevate the writing.",
            properties: {
                grammar: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            structure: { type: Type.STRING, description: "Name of the advanced grammar structure (e.g., 'Inversion')." },
                            example: { type: Type.STRING, description: "An example sentence using the structure, relevant to the student's topic." },
                        },
                        required: ["structure", "example"],
                    }
                },
                vocabulary: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            word: { type: Type.STRING, description: "An advanced vocabulary word or phrase." },
                            definition: { type: Type.STRING, description: "A simple definition of the word." },
                            example: { type: Type.STRING, description: "An example sentence using the word, relevant to the student's topic." },
                        },
                         required: ["word", "definition", "example"],
                    }
                }
            },
            required: ["grammar", "vocabulary"],
        };
    }
    
    // --- Build the Prompt ---
    let fullPrompt = `You are an expert English writing coach. Analyze the following student's writing based on their stated requirements and prompt. Your feedback must be constructive, insightful, and tailored to the student's English level: ${englishLevel}.

    **1. Writing Requirements:** ${requirements}
    **2. Writing Prompt:** ${prompt}
    **3. Student's Writing:**
    ---
    ${studentWriting}
    ---

    Your task is to provide feedback in a structured JSON format. The feedback must include a detailed analysis for each of these categories: ${dynamicCategories.join(', ')}.

    **Key Instructions:**
    - **Localization:** All 'strengths' and 'weaknesses' descriptions MUST be in Vietnamese. All 'explanation' fields in suggestions must ALSO be in Vietnamese.
    - **Writing Requirements Adherence:** This is the MOST important category. The student's writing has exactly ${wordCount} words. Strictly assess if this meets the specified word count requirement. You MUST use this provided word count in your feedback for this category. Also, assess all other requirements like tone, format, etc.
    - **Suggestions:** For each suggestion, provide the *exact* original text snippet and the suggested change.
    - **Suggestion Quality and Accuracy:** This is critical. All your suggestions in the 'changed' field must be grammatically flawless and logically sound within the context of the student's writing.
        - **Articles:** Pay close attention to articles (e.g., 'join a club or an activity' is correct for singular countable nouns).
        - **Contextual Agreement:** Ensure suggestions match the overall context. For example, if the writer describes multiple methods, a singular phrase like 'By using that way' should be corrected to a plural form like 'By using these ways'.
        - **Review:** Double-check every suggestion for accuracy.
    - **Scoring:** Be consistent with your scoring from 1-10 for categories.
    - **Think Out of the Box:** Provide creative and insightful suggestions that go beyond simple error correction, helping the student express their ideas more effectively.
    - **Collocations and Idioms:** For this category, identify the main topic of the writing (e.g., 'friendship'). Then, in the 'suggestions' array for this category, provide 3-4 relevant idioms. For each idiom, you MUST use the suggestion structure as follows:
        - "original": The idiom itself (e.g., "A friend in need is a friend indeed").
        - "changed": A relevant example sentence using the idiom.
        - "explanation": The idiom's meaning, in Vietnamese.`;

    if (levelIndex >= 4) { // C1 and above
        fullPrompt += `
        - **Advanced Enrichment:** Since this is a C1/C2 level student, you MUST provide a table of advanced grammar and vocabulary relevant to their topic to help them make their writing extraordinary. This should be in the 'advancedEnrichment' field.`;
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
        return feedbackObject;
    } catch (e) {
        console.error("Error parsing Gemini response:", e);
        throw new Error("Failed to get feedback from the AI. The response might not be valid JSON. Please try again.");
    }
}