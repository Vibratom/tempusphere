
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

const supportedLanguages = [
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


export function LanguageTools() {
    const [searchTerm, setSearchTerm] = useState('hello');
    const [sourceLang, setSourceLang] = useState('en_US');
    const [targetLang, setTargetLang] = useState('es');
    
    const [dictionaryResults, setDictionaryResults] = useState<DictionaryEntry[] | null>(null);
    const [translatedText, setTranslatedText] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const fetchResults = async () => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setError(null);
        setDictionaryResults(null);
        setTranslatedText(null);

        try {
            // Dictionary API call
            const dictPromise = fetch(`https://api.dictionaryapi.dev/api/v2/entries/${sourceLang}/${searchTerm}`)
              .then(res => res.json())
              .then(data => {
                  if (data.title === "No Definitions Found") {
                      throw new Error(`No dictionary definitions found for "${searchTerm}".`);
                  }
                  setDictionaryResults(data);
              });

            // Translator API call
            const translatorSourceLang = sourceLang.split('_')[0]; // e.g. en_US -> en
            const transPromise = fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(searchTerm)}&langpair=${translatorSourceLang}|${targetLang}`)
              .then(res => res.json())
              .then((data: TranslationResponse) => {
                  if (data.responseStatus !== 200) {
                      throw new Error('Translation failed.');
                  }
                  setTranslatedText(data.responseData.translatedText);
              });
            
            await Promise.allSettled([dictPromise, transPromise]);

        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchResults(); };
    const playAudio = (audioUrl: string) => { if (audioRef.current) { audioRef.current.src = audioUrl; audioRef.current.play(); }};
    const firstPhoneticWithAudio = dictionaryResults?.[0]?.phonetics.find(p => p.audio);


    return (
        <>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tighter">Language Lookup</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">Get definitions and translations for any word.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <audio ref={audioRef} />
                <form onSubmit={handleSearch} className="flex flex-col gap-2 mb-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input type="search" placeholder="Search for a word..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="text-base flex-1" />
                        <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <Search />}<span className="ml-2">Search</span></Button>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <Select value={sourceLang} onValueChange={setSourceLang}>
                            <SelectTrigger><div className="flex items-center gap-2"><BookOpen/><span>Dictionary: {supportedLanguages.find(l=>l.code === sourceLang)?.name}</span></div></SelectTrigger>
                            <SelectContent>{supportedLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <ArrowRightLeft className="h-5 w-5 text-muted-foreground flex-shrink-0 my-2 sm:my-0"/>
                        <Select value={targetLang} onValueChange={setTargetLang}>
                            <SelectTrigger><div className="flex items-center gap-2"><ArrowRightLeft/><span>Translate to: {translatorLanguages.find(l=>l.code === targetLang)?.name}</span></div></SelectTrigger>
                            <SelectContent>{translatorLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </form>

                 {error && <Card className="bg-destructive/10 border-destructive mt-4"><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>{error}</p></CardContent></Card>}
                {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8"/></div>}

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* Dictionary Result */}
                    <div className="space-y-4">
                        {dictionaryResults && (
                             <ScrollArea className="h-96 pr-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                    <div>
                                        <h2 className="text-3xl font-bold">{dictionaryResults[0].word}</h2>
                                        <p className="text-lg text-primary">{dictionaryResults[0].phonetic}</p>
                                    </div>
                                     {firstPhoneticWithAudio && (<Button variant="outline" onClick={() => playAudio(firstPhoneticWithAudio.audio)}><Volume2 className="mr-2"/>Play</Button>)}
                                </div>
                                <div className="space-y-6">
                                    {dictionaryResults[0].meanings.map((meaning, index) => (
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
                        )}
                    </div>
                    {/* Translator Result */}
                     <div className="space-y-4">
                        {translatedText && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-muted-foreground">Translation to {translatorLanguages.find(l=>l.code === targetLang)?.name}</p>
                                <p className="text-4xl font-bold text-primary">{translatedText}</p>
                            </div>
                        )}
                    </div>
                </div>

            </CardContent>
        </>
    )
}
