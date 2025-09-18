
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateText } from '@/ai/flows/text-generator-flow';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function TextGenerator() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            const result = await generateText({ prompt });
            setResponse(result.text);
        } catch (e) {
            console.error('Error generating text:', e);
            setError('Failed to generate response. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tighter">AI Text Generator</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">
                    Enter a prompt and get a response from an AI.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
                <div className="space-y-4">
                    <Textarea
                        id="prompt-input"
                        rows={4}
                        placeholder="e.g., Explain the concept of quantum computing in simple terms."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 resize-none"
                    />

                    <Button
                        id="generate-button"
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg shadow-md transition duration-200 transform hover:scale-105 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Generating...
                            </>
                        ) : (
                            'Generate Text'
                        )}
                    </Button>
                </div>

                {(response || error) && (
                    <div id="response-container" className="bg-muted/50 p-6 rounded-lg border">
                        <h2 className="text-lg font-bold text-card-foreground mb-2">AI Response</h2>
                        {error ? (
                            <p className="text-destructive">{error}</p>
                        ) : (
                            <div className="prose dark:prose-invert max-w-none text-card-foreground leading-relaxed whitespace-pre-wrap">
                                <ReactMarkdown>{response}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </>
    );
}
