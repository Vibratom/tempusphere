
'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, Search, Volume2, ArrowRight } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { translatorLanguages } from '@/lib/translator-languages';


// --- Wiktionary Types ---
interface WiktionaryDefinition {
  partOfSpeech: string;
  text: string;
  examples?: { text: string }[];
}

interface WiktionaryEntry {
  definitions: WiktionaryDefinition[];
}

// --- Internal Dictionary Types (to match existing UI) ---
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

// --- Translator Types ---
interface TranslationResponse {
  responseData: { translatedText: string; };
  responseStatus: number;
}

const parseWiktionaryResponse = (word: string, data: any): DictionaryEntry[] | null => {
    // Wiktionary API can return data in different shapes. 
    // Sometimes it's an array, sometimes an object with language keys.
    const definitionsArray = Array.isArray(data) ? data : data[Object.keys(data)[0]];

    if (!definitionsArray || definitionsArray.length === 0) return null;

    const meanings: Meaning[] = definitionsArray.flatMap((entry: WiktionaryEntry) => 
        entry.definitions.map(def => ({
            partOfSpeech: def.partOfSpeech || 'unknown',
            definitions: [{
                definition: def.text,
                example: def.examples?.[0]?.text.replace(/<[^>]*>/g, '') || '',
                synonyms: [],
                antonyms: []
            }]
        }))
    );
    
    // Group definitions by part of speech
    const groupedMeanings = meanings.reduce((acc, current) => {
        const existing = acc.find(m => m.partOfSpeech === current.partOfSpeech);
        if (existing) {
            existing.definitions.push(...current.definitions);
        } else {
            acc.push(current);
        }
        return acc;
    }, [] as Meaning[]);


    return [{
        word: word,
        phonetic: '',
        phonetics: [],
        meanings: groupedMeanings
    }];
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

    const fetchWiktionaryDefinition = async (word: string, langCode: string): Promise<DictionaryEntry[] | null> => {
        try {
            const wiktionaryLangCode = langCode.split('-')[0]; // Use base language code (e.g., 'zh' from 'zh-CN')
            const response = await fetch(`https://${wiktionaryLangCode}.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`);
            if (!response.ok) {
                 if (response.status === 404) return null; // Expected "not found" case
                 throw new Error(`Wiktionary API error: ${response.status}`);
            }
            const data = await response.json();
            return parseWiktionaryResponse(word, data);
        } catch (e) {
            console.warn(`Could not fetch Wiktionary definition for "${word}" in ${langCode}:`, e);
            return null; // Return null on any error to not block the UI
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
            const sourceDefPromise = fetchWiktionaryDefinition(searchTerm, translateFromLang);

            // --- 2. Fetch translation and its definition ---
            const translationPromise = fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(searchTerm)}&langpair=${translateFromLang}|${translateToLang}`)
                .then(res => res.json() as Promise<TranslationResponse>)
                .then(data => {
                    if (data.responseStatus !== 200 || !data.responseData.translatedText) {
                        throw new Error('Translation failed.');
                    }
                    const translatedText = data.responseData.translatedText;
                    // Now fetch the definition for the *translated* word
                    return fetchWiktionaryDefinition(translatedText, translateToLang);
                })
                .catch((e) => {
                    console.warn("Translation or translated definition fetch failed:", e);
                    // Create a fallback result with just the translated text if lookup fails
                     const translatedText = "Translation unavailable";
                     const fallbackResult: DictionaryEntry[] = [{
                        word: translatedText,
                        phonetic: '',
                        phonetics: [],
                        meanings: [{
                            partOfSpeech: 'translation',
                            definitions: [{ definition: `Could not find definition for translated word.`, example: '', synonyms: [], antonyms: [] }]
                        }]
                    }];
                    return fallbackResult;
                });
            
            const [sourceDef, translationDef] = await Promise.all([sourceDefPromise, translationPromise]);
            
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
