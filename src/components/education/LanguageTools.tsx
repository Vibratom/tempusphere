
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, Search, Volume2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { translatorLanguages } from '@/lib/translator-languages';


// --- API Types ---
interface Phonetic {
  text: string;
  audio: string;
}
interface Definition {
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
}
interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}
interface DictionaryEntry {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
}

interface LibreTranslateResponse {
    translatedText: string;
}

const parseFreeDictionaryResponse = (data: any[]): DictionaryEntry[] | null => {
    if (!data || data.length === 0) return null;
    // The API returns an array, we'll work with the first result
    return data.map(entry => ({
        word: entry.word,
        phonetic: entry.phonetic,
        phonetics: entry.phonetics || [],
        meanings: entry.meanings || [],
    }));
};

const WordDefinition = ({ results, langName }: { results: DictionaryEntry[] | null, langName: string }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const playAudio = (audioUrl: string) => { if (audioRef.current) { audioRef.current.src = audioUrl; audioRef.current.play(); }};
    
    if (!results) return <p className="text-muted-foreground text-center pt-4">No definition found for this word in {langName}.</p>;
    
    const firstPhoneticWithAudio = results[0]?.phonetics.find(p => p.audio);

    return (
        <>
            <audio ref={audioRef} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                    <h2 className="text-3xl font-bold">{results[0].word}</h2>
                    {results[0].phonetic && <p className="text-lg text-primary">{results[0].phonetic}</p>}
                </div>
                 {firstPhoneticWithAudio && (<Button variant="outline" onClick={() => playAudio(firstPhoneticWithAudio.audio)}><Volume2 className="mr-2"/>Play</Button>)}
            </div>
            <div className="space-y-6">
                {results[0].meanings.map((meaning, index) => (
                    <div key={index}>
                        <div className="flex items-center gap-4 mb-4"><h3 className="text-xl font-bold italic">{meaning.partOfSpeech}</h3><Separator className="flex-1" /></div>
                        {meaning.definitions.map((def, defIndex) => (
                            <div key={defIndex} className="ml-4 pl-4 border-l-2 border-primary/50 mb-4">
                                <p className="font-semibold">{defIndex + 1}. {def.definition}</p>
                                {def.example && <p className="text-muted-foreground italic mt-1">"{def.example}"</p>}
                                {def.synonyms?.length > 0 && <div className="mt-2"><span className="font-semibold text-sm">Synonyms: </span><span className="text-sm text-primary">{def.synonyms.join(', ')}</span></div>}
                                {def.antonyms?.length > 0 && <div className="mt-1"><span className="font-semibold text-sm">Antonyms: </span><span className="text-sm text-destructive">{def.antonyms.join(', ')}</span></div>}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    )
}

export function LanguageTools() {
    const [searchTerm, setSearchTerm] = useState('hello');
    const [translateFromLang, setTranslateFromLang] = useState('en');
    const [translateToLang, setTranslateToLang] = useState('es');
    
    const [sourceResults, setSourceResults] = useState<DictionaryEntry[] | null>(null);
    const [translationResults, setTranslationResults] = useState<DictionaryEntry[] | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDefinition = async (word: string, langCode: string): Promise<DictionaryEntry[] | null> => {
        try {
            // Use the Free Dictionary API
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${langCode}/${encodeURIComponent(word)}`);
            if (!response.ok) {
                 if (response.status === 404) return null;
                 throw new Error(`Dictionary API error: ${response.status}`);
            }
            const data = await response.json();
            return parseFreeDictionaryResponse(data);
        } catch (e) {
            console.warn(`Could not fetch definition for "${word}" in ${langCode}:`, e);
            return null;
        }
    };
    
    const fetchTranslation = async (word: string, from: string, to: string): Promise<string | null> => {
        try {
            const response = await fetch("https://libretranslate.de/translate", {
                method: "POST",
                body: JSON.stringify({
                    q: word,
                    source: from.split('-')[0], // LibreTranslate uses base language codes
                    target: to.split('-')[0],
                    format: "text",
                }),
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) throw new Error(`Translation API error: ${response.status}`);
            const data: LibreTranslateResponse = await response.json();
            return data.translatedText;
        } catch (e) {
             console.warn("Translation fetch failed:", e);
            return null;
        }
    };


    const fetchResults = async () => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setError(null);
        setSourceResults(null);
        setTranslationResults(null);

        try {
            // --- 1. Fetch source definition ---
            const sourceDefPromise = fetchDefinition(searchTerm, translateFromLang);

            // --- 2. Fetch translation ---
            const translatedText = await fetchTranslation(searchTerm, translateFromLang, translateToLang);
            
            let translationDefPromise: Promise<DictionaryEntry[] | null>;
            if (translatedText) {
                // --- 3. Fetch definition for the translated word ---
                translationDefPromise = fetchDefinition(translatedText, translateToLang);
            } else {
                // Create a fallback result if translation fails
                const fallbackResult: DictionaryEntry[] = [{
                    word: "Translation unavailable",
                    phonetic: '', phonetics: [],
                    meanings: [{
                        partOfSpeech: 'error',
                        definitions: [{ definition: `Could not translate the word.`, example: '', synonyms: [], antonyms: [] }]
                    }]
                }];
                translationDefPromise = Promise.resolve(fallbackResult);
            }

            // Await both definition lookups
            const [sourceDef, translationDef] = await Promise.all([sourceDefPromise, translationDefPromise]);
            
            setSourceResults(sourceDef);
            setTranslationResults(translationDef);

        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchResults(); };

    return (
        <>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tighter">Language Lookup</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">Get the definition of a word and its translation (with definition) in another language.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <form onSubmit={handleSearch} className="flex flex-col gap-2 mb-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input type="search" placeholder="Enter a word..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="text-base flex-1" />
                        <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <Search />}<span className="ml-2">Lookup</span></Button>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <Select value={translateFromLang} onValueChange={setTranslateFromLang}>
                            <SelectTrigger><div className="flex items-center gap-2"><span className="text-muted-foreground">From:</span><span>{translatorLanguages.find(l=>l.code === translateFromLang)?.name}</span></div></SelectTrigger>
                            <SelectContent>{translatorLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={translateToLang} onValueChange={setTranslateToLang}>
                            <SelectTrigger><div className="flex items-center gap-2"><span className="text-muted-foreground">To:</span><span>{translatorLanguages.find(l=>l.code === translateToLang)?.name}</span></div></SelectTrigger>
                            <SelectContent>{translatorLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </form>

                 {error && <Card className="bg-destructive/10 border-destructive mt-4"><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>{error}</p></CardContent></Card>}
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Source Definition Column */}
                    <div className="h-full">
                        <h3 className="font-bold text-lg text-center mb-4">Definition in {translatorLanguages.find(l=>l.code === translateFromLang)?.name}</h3>
                        <Card className="min-h-[20rem]">
                            <CardContent className="p-4">
                                {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8"/></div> : 
                                    <ScrollArea className="h-96 pr-4">
                                        <WordDefinition results={sourceResults} langName={translatorLanguages.find(l=>l.code === translateFromLang)?.name || ''} />
                                    </ScrollArea>
                                }
                            </CardContent>
                        </Card>
                    </div>

                     {/* Translation Definition Column */}
                    <div className="h-full">
                         <h3 className="font-bold text-lg text-center mb-4">Translation in {translatorLanguages.find(l=>l.code === translateToLang)?.name}</h3>
                        <Card className="min-h-[20rem]">
                            <CardContent className="p-4">
                                {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8"/></div> : 
                                    <ScrollArea className="h-96 pr-4">
                                        <WordDefinition results={translationResults} langName={translatorLanguages.find(l=>l.code === translateToLang)?.name || ''} />
                                    </ScrollArea>
                                }
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </>
    )
}

    