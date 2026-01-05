export interface Suggestion {
  original: string;
  changed: string;
  explanation: string;
  rule_summary: string;
  rule_meaning_vn: string; // New field for Vietnamese meaning
}

export interface FeedbackCategory {
  title: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
}

export interface GrammarSuggestion {
    structure: string;
    example: string;
}

export interface VocabularySuggestion {
    word: string;
    definition: string;
    example: string;
}

export interface AdvancedEnrichment {
    grammar: GrammarSuggestion[];
    vocabulary: VocabularySuggestion[];
}

export interface AIFeedback {
  overallScore: number;
  overallFeedback: string;
  categories: FeedbackCategory[];
  advancedEnrichment?: AdvancedEnrichment;
}
