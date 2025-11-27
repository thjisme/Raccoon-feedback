import React from 'react';

interface InputFormProps {
    requirements: string;
    setRequirements: (value: string) => void;
    prompt: string;
    setPrompt: (value: string) => void;
    studentWriting: string;
    setStudentWriting: (value: string) => void;
    isLoading: boolean;
    onSubmit: () => void;
    apiKey: string;
}

const LabeledTextarea: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    rows?: number;
}> = ({ id, label, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {label}
        </label>
        <textarea
            id={id}
            rows={rows}
            value={value}
            onChange={onChange}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition duration-150 ease-in-out"
            placeholder={placeholder}
        ></textarea>
    </div>
);


const InputForm: React.FC<InputFormProps> = ({
    requirements,
    setRequirements,
    prompt,
    setPrompt,
    studentWriting,
    setStudentWriting,
    isLoading,
    onSubmit,
    apiKey
}) => {
    return (
        <div className="space-y-6">
            <LabeledTextarea
                id="requirements"
                label="1. Writing Requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g., 'Write a 150-word persuasive essay for an academic audience.'"
            />
            <LabeledTextarea
                id="prompt"
                label="2. Writing Prompt / Question"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'What is one way to make new friends at school, and what words will you use?'"
            />
            <LabeledTextarea
                id="student-writing"
                label="3. Your Writing"
                value={studentWriting}
                onChange={(e) => setStudentWriting(e.target.value)}
                placeholder="Paste your full text here..."
                rows={10}
            />
            <button
                type="button"
                onClick={onSubmit}
                disabled={isLoading || !studentWriting.trim() || !apiKey.trim()}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600 transition-colors duration-200"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </>
                ) : (
                    'Get Feedback'
                )}
            </button>
        </div>
    );
}

export default InputForm;