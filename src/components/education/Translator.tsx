
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Footer } from '../tempusphere/Footer';
import { Header } from '../tempusphere/Header';
import { translatorLanguages } from '@/lib/translator-languages';
import { useToast } from '@/hooks/use-toast';

export function Translator() {
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('es');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (response.status === 429 && retries > 0) {
                    console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
                    await new Promise(res => setTimeout(res, delay));
                    return fetchWithRetry(url, options, retries - 1, delay * 2);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            if (retries > 0) {
                console.error(`Fetch failed. Retrying in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
                return fetchWithRetry(url, options, retries - 1, delay * 2);
            }
            throw error;
        }
    };

    const handleTranslate = async () => {
        if (!sourceText.trim()) return;

        setIsLoading(true);
        setTranslatedText('');

        const sourceLangName = translatorLanguages.find(l => l.code === sourceLang)?.name || 'English';
        const targetLangName = translatorLanguages.find(l => l.code === targetLang)?.name || 'Spanish';

        const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. Only provide the translated text, with no additional commentary or explanations.

Text to translate:
"${sourceText}"`;

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
        };

        try {
             const response = await fetchWithRetry(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received. Please try again.";
            setTranslatedText(text);

        } catch (e: any) {
            console.error('Error translating text:', e);
            toast({
                variant: 'destructive',
                title: 'Translation Failed',
                description: 'Could not get a translation. Please try again.'
            })
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSwapLanguages = () => {
        const currentSource = sourceLang;
        setSourceLang(targetLang);
        setTargetLang(currentSource);
    };

    return (
        <div className="min-h-screen w-full bg-background flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center p-4 md:p-8">
                <Card className="w-full max-w-4xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold tracking-tighter">AI Translator</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">
                            Translate text between languages with AI.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                             <div className="flex flex-col gap-2">
                                <Select value={sourceLang} onValueChange={setSourceLang}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {translatorLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Textarea
                                    rows={8}
                                    placeholder="Enter text to translate..."
                                    value={sourceText}
                                    onChange={(e) => setSourceText(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={handleSwapLanguages} aria-label="Swap languages">
                                <ArrowRightLeft className="h-4 w-4"/>
                            </Button>
                             <div className="flex flex-col gap-2">
                                <Select value={targetLang} onValueChange={setTargetLang}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {translatorLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Textarea
                                    rows={8}
                                    placeholder="Translation will appear here..."
                                    value={translatedText}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleTranslate}
                            disabled={isLoading || !sourceText.trim()}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Translating...
                                </>
                            ) : (
                                'Translate'
                            )}
                        </Button>

                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
