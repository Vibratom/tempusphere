
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, Search, Volume2, BookOpen } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

// API Response Types
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

export function DictionaryApp() {
  const [searchTerm, setSearchTerm] = useState('hello');
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
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError(`No definitions found for "${word}". Please check the spelling.`);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }
      const data: DictionaryEntry[] = await response.json();
      setResults(data);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch definitions. Please check your network connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDefinition(searchTerm);
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
    }
  };

  const firstPhoneticWithAudio = results?.[0]?.phonetics.find(p => p.audio);

  return (
    <div className="w-full max-w-4xl mx-auto">
        <audio ref={audioRef} />
        <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Dictionary</h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-3xl">Look up word definitions, pronunciations, synonyms, and more.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <Input
                type="search"
                placeholder="Search for a word..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-base"
            />
            <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                <span className="sr-only sm:not-sr-only sm:ml-2">Search</span>
            </Button>
        </form>

        {error && (
            <Card className="bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                </CardContent>
            </Card>
        )}

        {results && (
             <Card>
                <ScrollArea className="h-[60vh]">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <CardTitle className="text-4xl font-bold">{results[0].word}</CardTitle>
                                <CardDescription className="text-lg text-primary">{results[0].phonetic}</CardDescription>
                            </div>
                             {firstPhoneticWithAudio && (
                                <Button variant="outline" onClick={() => playAudio(firstPhoneticWithAudio.audio)}>
                                    <Volume2 className="mr-2"/>
                                    Play Pronunciation
                                </Button>
                             )}
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 space-y-6">
                        {results[0].meanings.map((meaning, index) => (
                            <div key={index}>
                                <div className="flex items-center gap-4 mb-4">
                                    <h3 className="text-2xl font-bold italic">{meaning.partOfSpeech}</h3>
                                    <Separator className="flex-1" />
                                </div>
                                
                                {meaning.definitions.map((def, defIndex) => (
                                    <div key={defIndex} className="ml-4 pl-4 border-l-2 border-primary/50 mb-4">
                                        <p className="font-semibold">{defIndex + 1}. {def.definition}</p>
                                        {def.example && <p className="text-muted-foreground italic mt-1">"{def.example}"</p>}
                                        {def.synonyms && def.synonyms.length > 0 && (
                                            <div className="mt-2">
                                                <span className="font-semibold text-sm">Synonyms: </span>
                                                <span className="text-sm text-primary">{def.synonyms.join(', ')}</span>
                                            </div>
                                        )}
                                        {def.antonyms && def.antonyms.length > 0 && (
                                            <div className="mt-1">
                                                <span className="font-semibold text-sm">Antonyms: </span>
                                                <span className="text-sm text-destructive">{def.antonyms.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </CardContent>
                </ScrollArea>
            </Card>
        )}
    </div>
  );
}
