import React, { useState, useRef, useEffect } from 'react';
import type { AIFeedback, Suggestion, AdvancedEnrichment } from '../types';

const Highlight: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <span className={`px-1.5 py-0.5 rounded-md ${className}`}>
        {children}
    </span>
);

const SuggestionCard: React.FC<{ suggestion: Suggestion; index: number; categoryTitle: string }> = ({ suggestion, index, categoryTitle }) => {
    const [stage, setStage] = useState<'hidden' | 'explanation' | 'drill' | 'revealed'>('hidden');
    const [drillCount, setDrillCount] = useState(0);
    const [userDrillInput, setUserDrillInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Fallback if data is missing (for older API responses)
    const targetRule = suggestion.rule_summary || "Fix the grammar error";
    const targetMeaningVN = suggestion.rule_meaning_vn || "";

    useEffect(() => {
        if (stage === 'drill' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [stage, drillCount]);

    const handleDrillSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Strict Check: User must match the English rule (case-insensitive)
        if (userDrillInput.trim().toLowerCase() !== targetRule.toLowerCase()) {
            return; 
        }

        const nextCount = drillCount + 1;
        setDrillCount(nextCount);
        setUserDrillInput('');

        if (nextCount >= 3) {
            setStage('revealed');
        }
    };

    if (categoryTitle === 'Collocations and Idioms') {
        return (
             <li className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold">{index + 1}</span>
                    <div className="flex-grow">
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{suggestion.original}</p>
                         <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Nghĩa là:</span> {suggestion.explanation}</p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300 italic bg-gray-100 dark:bg-gray-800 p-2 rounded-md">VD: "{suggestion.changed}"</p>
                    </div>
                </div>
            </li>
        )
    }

    return (
        <li className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-300">
            <div className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold">{index + 1}</span>
                <div className="flex-grow w-full">
                    
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                        <Highlight className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 decoration-red-500 underline decoration-2 underline-offset-2">
                            {suggestion.original}
                        </Highlight>
                    </p>

                    {stage === 'hidden' && (
                        <button
                            onClick={() => setStage('explanation')}
                            className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Why is this wrong?
                        </button>
                    )}

                    {(stage === 'explanation' || stage === 'drill' || stage === 'revealed') && (
                        <div className="mt-3 animate-fade-in">
                            <p className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-4 border-blue-400">
                                <span className="font-bold text-blue-700 dark:text-blue-300">Tại sao:</span> {suggestion.explanation}
                            </p>
                            
                            {stage === 'explanation' && (
                                <button
                                    onClick={() => setStage('drill')}
                                    className="mt-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-green-700 dark:text-green-400 font-medium transition-colors"
                                >
                                    Practice & Reveal Answer &rarr;
                                </button>
                            )}
                        </div>
                    )}

                    {stage === 'drill' && (
                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-700/30 animate-fade-in">
                            <h5 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                                🔒 Type the English rule to unlock:
                            </h5>
                            
                            {/* RULE DISPLAY WITH VIETNAMESE MEANING */}
                            <div 
                                className="mb-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-center select-none"
                                onCopy={(e) => e.preventDefault()}
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <div className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400">
                                    {targetRule}
                                </div>
                                {targetMeaningVN && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                                        ({targetMeaningVN})
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleDrillSubmit} className="flex flex-col gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userDrillInput}
                                    onChange={(e) => setUserDrillInput(e.target.value)}
                                    onPaste={(e) => e.preventDefault()}
                                    placeholder="Type only the English rule above..."
                                    className={`w-full text-sm p-2 border rounded bg-white dark:bg-gray-800 outline-none transition-colors ${
                                        userDrillInput && userDrillInput.toLowerCase() !== targetRule.substring(0, userDrillInput.length).toLowerCase()
                                        ? 'border-red-300 ring-1 ring-red-300'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-yellow-400'
                                    }`}
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map((dot) => (
                                            <div key={dot} className={`h-2 w-2 rounded-full transition-colors duration-300 ${drillCount > dot ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                        ))}
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={userDrillInput.trim().toLowerCase() !== targetRule.toLowerCase()}
                                        className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Submit ({drillCount}/3)
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {stage === 'revealed' && (
                        <div className="mt-4 animate-fade-in">
                             <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">Correct Sentence:</p>
                            <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span className="font-bold text-green-600 dark:text-green-400 text-xl">&rarr;</span>
                                <Highlight className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 font-semibold text-lg">
                                    {suggestion.changed}
                                </Highlight>
                            </p>
                        </div>
                    )}
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
                        <tr><th className="px-4 py-2 rounded-l-lg">Structure</th><th className="px-4 py-2 rounded-r-lg">Example</th></tr>
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
                        <tr><th className="px-4 py-2 rounded-l-lg">Word/Phrase</th><th className="px-4 py-2">Definition</th><th className="px-4 py-2 rounded-r-lg">Example</th></tr>
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
        let text = `Feedback Report\n\nOverall Score: ${feedbackData.overallScore}/100\nOverall Feedback: ${feedbackData.overallFeedback}\n\n`;
        feedbackData.categories.forEach(category => {
            text += `CATEGORY: ${category.title}\nScore: ${category.score}/10\n\n`;
            if (category.suggestions.length > 0) {
                text += `Suggestions:\n`;
                category.suggestions.forEach((s, i) => {
                     if (category.title === 'Collocations and Idioms') {
                        text += `${i + 1}. Idiom: ${s.original} -> "${s.changed}" (${s.explanation})\n`;
                    } else {
                        text += `${i + 1}. Original: "${s.original}" -> Suggestion: "${s.changed}"\n   Rule: ${s.rule_summary || s.explanation}\n`;
                    }
                });
            }
            text += "\n";
        });
        return text;
    };
    
    const handleCopyFeedback = () => {
        const feedbackText = formatFeedbackForCopy(feedback);
        navigator.clipboard.writeText(feedbackText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); 
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
                                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">{category.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">⚠️ Cần cải thiện</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">{category.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
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
                <button onClick={handleCopyFeedback} className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-all duration-200" disabled={isCopied}>
                    {isCopied ? "Copied!" : "Copy Feedback"}
                </button>
            </div>
        </div>
    );
};

export default FeedbackDisplay;
