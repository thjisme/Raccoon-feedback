import React, { useState } from 'react';
import type { AIFeedback, Suggestion, AdvancedEnrichment } from '../types';

const Highlight: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <span className={`px-1.5 py-0.5 rounded-md ${className}`}>
        {children}
    </span>
);

const SuggestionCard: React.FC<{ suggestion: Suggestion; index: number; categoryTitle: string }> = ({ suggestion, index, categoryTitle }) => {
    const [showSuggestion, setShowSuggestion] = useState(false);

    // Special rendering for Idiom suggestions
    if (categoryTitle === 'Collocations and Idioms') {
        return (
             <li className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold">{index + 1}</span>
                    <div className="flex-grow">
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                           {suggestion.original}
                        </p>
                         <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Nghĩa là:</span> {suggestion.explanation}
                        </p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300 italic bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                           VD: "{suggestion.changed}"
                        </p>
                    </div>
                </div>
            </li>
        )
    }

    // Default rendering for corrections
    return (
        <li className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold">{index + 1}</span>
                <div className="flex-grow">
                     <p className="text-gray-700 dark:text-gray-300">
                        <Highlight className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through">'{suggestion.original}'</Highlight>
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Tại sao:</span> {suggestion.explanation}
                    </p>
                    <div className="mt-2">
                        {showSuggestion ? (
                            <p className="text-gray-700 dark:text-gray-300 animate-fade-in">
                                <span className="font-bold text-gray-900 dark:text-white">&rarr;</span>
                                <Highlight className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 ml-2">'{suggestion.changed}'</Highlight>
                            </p>
                        ) : (
                            <button
                                onClick={() => setShowSuggestion(true)}
                                className="text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline transition-colors"
                                aria-label={`See suggestion for '${suggestion.original}'`}
                            >
                                See suggestion
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </li>
    );
};

const AdvancedEnrichmentTable: React.FC<{ enrichment: AdvancedEnrichment }> = ({ enrichment }) => (
    <div className="mt-6 p-4 border-2 border-dashed border-purple-400 dark:border-purple-600 rounded-lg bg-purple-50 dark:bg-purple-900/20">
        <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-4">✨ Advanced Enrichment</h3>
        
        <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Grammar Structures</h4>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="px-4 py-2 rounded-l-lg">Structure</th>
                            <th scope="col" className="px-4 py-2 rounded-r-lg">Example</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrichment.grammar.map((item, i) => (
                            <tr key={i} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.structure}</td>
                                <td className="px-4 py-3 italic">"{item.example}"</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Vocabulary</h4>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="px-4 py-2 rounded-l-lg">Word/Phrase</th>
                            <th scope="col" className="px-4 py-2">Definition</th>
                            <th scope="col" className="px-4 py-2 rounded-r-lg">Example</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrichment.vocabulary.map((item, i) => (
                             <tr key={i} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.word}</td>
                                <td className="px-4 py-3">{item.definition}</td>
                                <td className="px-4 py-3 italic">"{item.example}"</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);


const FeedbackDisplay: React.FC<{ feedback: AIFeedback }> = ({ feedback }) => {
    const [isCopied, setIsCopied] = useState(false);

    const formatFeedbackForCopy = (feedbackData: AIFeedback): string => {
        let text = `Feedback Report\n\n`;
        text += `Overall Score: ${feedbackData.overallScore}/100\n`;
        text += `Overall Feedback: ${feedbackData.overallFeedback}\n\n`;
        text += "========================================\n\n";
    
        feedbackData.categories.forEach(category => {
            text += `CATEGORY: ${category.title}\n`;
            text += `Score: ${category.score}/10\n\n`;
    
            text += `Strengths:\n`;
            category.strengths.forEach(s => text += `- ${s}\n`);
            text += `\n`;
    
            text += `Weaknesses:\n`;
            category.weaknesses.forEach(w => text += `- ${w}\n`);
            text += `\n`;
    
            if (category.suggestions.length > 0) {
                text += `Suggestions:\n`;
                category.suggestions.forEach((s, i) => {
                     if (category.title === 'Collocations and Idioms') {
                        text += `${i + 1}. Idiom: ${s.original}\n`;
                        text += `   Meaning: ${s.explanation}\n`;
                        text += `   Example: "${s.changed}"\n\n`;
                    } else {
                        text += `${i + 1}. Original: "${s.original}"\n`;
                        text += `   Suggestion: "${s.changed}"\n`;
                        text += `   Reason: ${s.explanation}\n\n`;
                    }
                });
            }
            text += "----------------------------------------\n\n";
        });
        
        if (feedbackData.advancedEnrichment) {
            text += "ADVANCED ENRICHMENT\n\n";
            text += "Grammar Structures:\n";
            feedbackData.advancedEnrichment.grammar.forEach(g => {
                text += `- ${g.structure}: "${g.example}"\n`;
            });
            text += "\n";
            
            text += "Vocabulary:\n";
            feedbackData.advancedEnrichment.vocabulary.forEach(v => {
                text += `- ${v.word} (${v.definition}): "${v.example}"\n`;
            });
        }
    
        return text;
    };
    
    const handleCopyFeedback = () => {
        const feedbackText = formatFeedbackForCopy(feedback);
        navigator.clipboard.writeText(feedbackText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Feedback Report</h2>
            <div className="flex items-baseline gap-4 mb-4">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Overall Score:</p>
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{feedback.overallScore}<span className="text-2xl text-gray-400">/100</span></span>
            </div>
            <p className="mb-8 text-gray-600 dark:text-gray-400">{feedback.overallFeedback}</p>

            <div className="space-y-8">
                {feedback.categories.map((category, index) => (
                    <div key={index} className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{category.title}</h3>
                            <div className="text-lg font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{category.score}/10</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ Điểm mạnh</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                    {category.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">⚠️ Cần cải thiện</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                    {category.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        </div>

                        {category.suggestions.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">💡 Gợi ý</h4>
                                <ul className="space-y-3">
                                    {category.suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} index={i} categoryTitle={category.title} />)}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
                
                {feedback.advancedEnrichment && <AdvancedEnrichmentTable enrichment={feedback.advancedEnrichment} />}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                <button
                    onClick={handleCopyFeedback}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 transition-all duration-200"
                    disabled={isCopied}
                >
                    {isCopied ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h4M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7h8m-5 5h2" />
                            </svg>
                            Copy Feedback
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default FeedbackDisplay;