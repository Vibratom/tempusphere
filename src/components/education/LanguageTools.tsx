
'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, Search, Volume2, BookOpen, ArrowRightLeft } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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


function Dictionary() {
  const [searchTerm, setSearchTerm] = useState('hello');
  const [language, setLanguage] = useState('en_US');
  const [results, setResults] = useState<DictionaryEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchDefinition = async (word: string) => {
    if (!word.trim()) return;
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${language}/${word}`);
      if (!response.ok) {
        throw new Error(response.status === 404 ? `No definitions found for "${word}".` : `HTTP error! status: ${response.status}`);
      }
      const data: DictionaryEntry[] = await response.json();
      setResults(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchDefinition(searchTerm); };
  const playAudio = (audioUrl: string) => { if (audioRef.current) { audioRef.current.src = audioUrl; audioRef.current.play(); }};
  const firstPhoneticWithAudio = results?.[0]?.phonetics.find(p => p.audio);

  return (
    <div className="w-full mx-auto p-4 md:p-6">
        <audio ref={audioRef} />
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-1 flex gap-2">
                <Input type="search" placeholder="Search for a word..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="text-base" />
                <Select value={language} onValueChange={setLanguage}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent>{supportedLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <Button type="submit" disabled={isLoading} className="sm:w-auto">{isLoading ? <Loader2 className="animate-spin" /> : <Search />}<span className="sr-only sm:not-sr-only sm:ml-2">Search</span></Button>
        </form>

        {error && <Card className="bg-destructive/10 border-destructive mt-4"><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>{error}</p></CardContent></Card>}
        {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8"/></div>}

        {results && (
             <ScrollArea className="h-72 mt-4">
                <div className="pr-4">
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
                </div>
            </ScrollArea>
        )}
    </div>
  );
}

// --- Translator Types ---
interface TranslationResponse {
  responseData: { translatedText: string; };
  responseStatus: number;
}

function Translator() {
  const [sourceText, setSourceText] = useState('Hello World');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!sourceText.trim()) return;
    setIsLoading(true);
    setError(null);
    setTranslatedText('');
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLang}|${targetLang}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: TranslationResponse = await response.json();
      if (data.responseStatus !== 200) throw new Error('Translation failed. Please check the languages.');
      setTranslatedText(data.responseData.translatedText);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const swapLanguages = () => { const tempLang = sourceLang; setSourceLang(targetLang); setTargetLang(tempLang); };

  return (
    <div className="w-full mx-auto p-4 md:p-6">
        <form onSubmit={handleTranslate} className="flex flex-col gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 items-center">
                <Select value={sourceLang} onValueChange={setSourceLang}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{translatorLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}</SelectContent></Select>
                <Button type="button" variant="ghost" size="icon" onClick={swapLanguages} className="flex-shrink-0"><ArrowRightLeft className="h-5 w-5"/></Button>
                <Select value={targetLang} onValueChange={setTargetLang}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{translatorLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}</SelectContent></Select>
            </div>
             <Input type="text" placeholder="Enter text to translate..." value={sourceText} onChange={(e) => setSourceText(e.target.value)} className="text-base" />
            <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <ArrowRightLeft />}<span className="ml-2">Translate</span></Button>
        </form>

        {error && <Card className="bg-destructive/10 border-destructive mt-4"><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>{error}</p></CardContent></Card>}
        {translatedText && <div className="mt-4"><h3 className="text-lg font-semibold">Translation:</h3><p className="text-xl font-semibold text-primary">{translatedText}</p></div>}
    </div>
  );
}


export function LanguageTools() {
    return (
        <>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tighter">Language Tools</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">Look up definitions or translate words between languages.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="dictionary">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="dictionary"><BookOpen className="mr-2"/>Dictionary</TabsTrigger>
                        <TabsTrigger value="translator"><ArrowRightLeft className="mr-2"/>Translator</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dictionary">
                        <Dictionary />
                    </TabsContent>
                    <TabsContent value="translator">
                        <Translator />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </>
    )
}
