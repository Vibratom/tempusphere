
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { translatorLanguages } from '@/lib/translator-languages';

// API Response Type
interface TranslationResponse {
  responseData: {
    translatedText: string;
  };
  responseStatus: number;
}

export function TranslatorApp() {
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TranslationResponse = await response.json();
      if (data.responseStatus !== 200) {
        throw new Error('Translation failed. Please check the languages and try again.');
      }
      setTranslatedText(data.responseData.translatedText);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const swapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex flex-col items-center text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tighter">Translator</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">Quickly translate words and phrases between languages.</p>
        </div>

        <form onSubmit={handleTranslate} className="flex flex-col gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 items-center">
                 <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {translatorLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" onClick={swapLanguages} className="flex-shrink-0">
                    <ArrowRightLeft className="h-5 w-5"/>
                </Button>
                <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {translatorLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <Input
                type="text"
                placeholder="Enter text to translate..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="text-base"
            />
            <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRightLeft />}
                <span className="ml-2">Translate</span>
            </Button>
        </form>

        {error && (
            <Card className="bg-destructive/10 border-destructive mt-4">
                <CardHeader><CardTitle>Error</CardTitle></CardHeader>
                <CardContent><p>{error}</p></CardContent>
            </Card>
        )}

        {translatedText && (
             <Card>
                <CardHeader>
                    <CardTitle>Translation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg font-semibold text-primary">{translatedText}</p>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
