
'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, Search, Volume2, BookOpen, ArrowRightLeft } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { translatorLanguages } from '@/lib/translator-languages';


// --- Dictionary Types ---
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

const supportedDictionaryLanguages = [
    { code: 'en_US', name: 'English (US)' }, { code: 'hi', name: 'Hindi' }, { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }, { code: 'ja', name: 'Japanese' }, { code: 'ru', name: 'Russian' },
    { code: 'en_GB', name: 'English (UK)' }, { code: 'de', name: 'German' }, { code: 'it', name: 'Italian' },
    { code: 'ko', name: 'Korean' }, { code: 'pt-BR', name: 'Brazilian Portuguese' }, { code: 'ar', name: 'Arabic' },
    { code: 'tr', name: 'Turkish' },
];


// --- Translator Types ---
interface TranslationResponse {
  responseData: { translatedText: string; };
  responseStatus: number;
}


const WordDefinition = ({ results }: { results: DictionaryEntry[] | null }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const playAudio = (audioUrl: string) => { if (audioRef.current) { audioRef.current.src = audioUrl; audioRef.current.play(); }};
    const firstPhoneticWithAudio = results?.[0]?.phonetics.find(p => p.audio);

    if (!results) return null;

    return (
        <>
            <audio ref={audioRef} />
            <ScrollArea className="h-96 pr-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div>
                        <h2 className="text-3xl font-bold">{results[0].word}</h2>
                        <p className="text-lg text-primary">{results[0].phonetic}</p>
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
            </ScrollArea>
        </>
    )
}

export function LanguageTools() {
    const [searchTerm, setSearchTerm] = useState('hello');
    const [translateFromLang, setTranslateFromLang] = useState('en');
    const [translateToLang, setTranslateToLang] = useState('es');
    
    const [translationResults, setTranslationResults] = useState<DictionaryEntry[] | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResults = async () => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setError(null);
        setTranslationResults(null);

        try {
            const transPromise = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(searchTerm)}&langpair=${translateFromLang}|${translateToLang}`);
            const transData: TranslationResponse = await transPromise.json();
            
            if (transData.responseStatus !== 200 || !transData.responseData.translatedText) {
              throw new Error('Translation failed.');
            }
            const translatedText = transData.responseData.translatedText;
            
            const targetLangCode = translateToLang.split('-')[0];
            const targetDictionaryLang = supportedDictionaryLanguages.find(l => l.code.startsWith(targetLangCode))?.code;

            if (targetDictionaryLang) {
              try {
                const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${targetDictionaryLang}/${translatedText}`);
                if (dictRes.ok) {
                    const dictData = await dictRes.json();
                    if (Array.isArray(dictData)) {
                        setTranslationResults(dictData);
                        return; // Success, we are done
                    }
                }
              } catch (e) {
                 // Dictionary for translated word not found, proceed to fallback
              }
            }
            
            // Fallback: If no dictionary entry is found for the translated word, just show the translation.
            const fallbackResult: DictionaryEntry[] = [{
                word: translatedText,
                phonetic: '',
                phonetics: [],
                meanings: [{
                    partOfSpeech: 'translation',
                    definitions: [{ definition: `Direct translation of "${searchTerm}"`, example: '', synonyms: [], antonyms: [] }]
                }]
            }];
            setTranslationResults(fallbackResult);

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
                <CardTitle className="text-2xl font-bold tracking-tighter">Language Translator & Dictionary</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">Translate a word and get its definition in the target language.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <form onSubmit={handleSearch} className="flex flex-col gap-2 mb-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input type="search" placeholder="Enter a word..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="text-base flex-1" />
                        <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <Search />}<span className="ml-2">Translate</span></Button>
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
                
                <div className="mt-6">
                    {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8"/></div>}
                    {!isLoading && translationResults && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-center">Result in {translatorLanguages.find(l=>l.code === translateToLang)?.name}</h3>
                            <WordDefinition results={translationResults} />
                        </div>
                    )}
                     {!isLoading && !translationResults && !error && (
                        <p className="text-muted-foreground text-center pt-4">Enter a word to get started.</p>
                     )}
                </div>
            </CardContent>
        </>
    )
}
