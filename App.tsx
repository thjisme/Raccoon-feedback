import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import FeedbackDisplay from './components/FeedbackDisplay';
import Spinner from './components/Spinner';
import ErrorMessage from './components/ErrorMessage';
import { getWritingFeedback } from './services/geminiService';
import type { AIFeedback } from './types';

const HelpModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [lang, setLang] = useState<'en' | 'vi'>('en');

    if (!isOpen) return null;

    const en_instructions = (
        <>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">How to Get Your API Key</h3>
            <ol className="list-decimal list-inside mt-2 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Go to Google AI Studio by clicking the link below.</li>
                <li>Log in with your Google account.</li>
                <li>Click the <strong>"Get API key"</strong> button.</li>
                <li>Click <strong>"Create API key in new project"</strong>.</li>
                <li>Copy the generated key and paste it into the input field in the app.</li>
            </ol>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline">
                Go to Google AI Studio &rarr;
            </a>
        </>
    );

    const vi_instructions = (
        <>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Cách Lấy Khóa API</h3>
            <ol className="list-decimal list-inside mt-2 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Truy cập Google AI Studio bằng liên kết bên dưới.</li>
                <li>Đăng nhập bằng tài khoản Google của bạn.</li>
                <li>Nhấp vào nút <strong>"Get API key"</strong> (Lấy khóa API).</li>
                <li>Nhấp vào <strong>"Create API key in new project"</strong> (Tạo khóa API trong dự án mới).</li>
                <li>Sao chép khóa được tạo và dán vào ô nhập liệu trong ứng dụng.</li>
            </ol>
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline">
                Đi đến Google AI Studio &rarr;
            </a>
        </>
    );
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setLang('en')} className={`px-3 py-1 text-sm rounded-md ${lang === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>English</button>
                        <button onClick={() => setLang('vi')} className={`px-3 py-1 text-sm rounded-md ${lang === 'vi' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Tiếng Việt</button>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&times;</button>
                </div>
                {lang === 'en' ? en_instructions : vi_instructions}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [requirements, setRequirements] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    const [studentWriting, setStudentWriting] = useState<string>('');

    const [apiKey, setApiKey] = useState<string>('');
    const [englishLevel, setEnglishLevel] = useState<string>('B1 Intermediate');
    const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<AIFeedback | null>(null);

     useEffect(() => {
        const savedKey = localStorage.getItem('gemini-api-key');
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleApiKeyChange = (key: string) => {
        setApiKey(key);
        localStorage.setItem('gemini-api-key', key);
    };

    const handleGetFeedback = async () => {
        if (!apiKey.trim()) {
            setError("Please provide your Google AI Studio API key in the configuration section.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setFeedback(null);
        try {
            // Calculate word count locally for accuracy
            const wordCount = studentWriting.trim().split(/\s+/).filter(Boolean).length;
            const result = await getWritingFeedback(requirements, prompt, studentWriting, englishLevel, apiKey, wordCount);
            setFeedback(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const englishLevels = [
        "A1 Beginner",
        "A2 Elementary",
        "B1 Intermediate",
        "B2 Upper-Intermediate",
        "C1 Advanced",
        "C2 Proficient"
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Header />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="api-key" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Google AI Studio API Key
                            </label>
                            <div className="flex items-center">
                                <input
                                    id="api-key"
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => handleApiKeyChange(e.target.value)}
                                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-l-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150 ease-in-out"
                                    placeholder="Enter your API key..."
                                />
                                <button onClick={() => setIsHelpModalOpen(true)} aria-label="Help with API Key" className="p-2.5 bg-gray-200 dark:bg-gray-600 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                        <div>
                             <label htmlFor="level-select" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Student's English Level
                            </label>
                            <select
                                id="level-select"
                                value={englishLevel}
                                onChange={(e) => setEnglishLevel(e.target.value)}
                                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition"
                            >
                                {englishLevels.map(level => <option key={level} value={level}>{level}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                         <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Enter Your Writing</h2>
                        <InputForm
                            requirements={requirements}
                            setRequirements={setRequirements}
                            prompt={prompt}
                            setPrompt={setPrompt}
                            studentWriting={studentWriting}
                            setStudentWriting={setStudentWriting}
                            isLoading={isLoading}
                            onSubmit={handleGetFeedback}
                            apiKey={apiKey}
                        />
                    </div>

                    <div className="min-h-[400px]">
                        {isLoading && <Spinner />}
                        {error && <ErrorMessage message={error} />}
                        {feedback && <FeedbackDisplay feedback={feedback} />}
                        {!isLoading && !error && !feedback && (
                             <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Your feedback will appear here</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">Configure your API key, then fill out the form and click "Get Feedback" to start.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
        </div>
    );
};

export default App;