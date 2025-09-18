
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, Search, Map, Users, Languages, Landmark, Coins, Globe } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { Separator } from '../ui/separator';

// API Response Types
interface Country {
  name: {
    common: string;
    official: string;
  };
  flags: {
    svg: string;
    alt: string;
  };
  capital: string[];
  population: number;
  region: string;
  subregion: string;
  languages: Record<string, string>;
  currencies: Record<string, { name: string; symbol: string }>;
  maps: {
    googleMaps: string;
  };
}

export function CountryExplorer() {
  const [searchTerm, setSearchTerm] = useState('United States');
  const [results, setResults] = useState<Country[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountry = async (name: string) => {
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${name}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError(`Could not find a country named "${name}". Please check the spelling.`);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }
      const data: Country[] = await response.json();
      setResults(data);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch country data. Please check your network connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCountry('United States');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCountry(searchTerm);
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number | undefined }) => (
    <div className="flex items-start gap-3 text-sm">
        <div className="text-muted-foreground">{icon}</div>
        <span className="font-semibold">{label}:</span>
        <span className="text-muted-foreground text-right flex-1">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex flex-col items-center text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tighter">Country Explorer</h1>
            <p className="text-md text-muted-foreground mt-1 max-w-3xl">Discover information about countries around the world.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
                type="search"
                placeholder="Search for a country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-base"
            />
            <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                <span className="sr-only sm:not-sr-only sm:ml-2">Search</span>
            </Button>
        </form>

        {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-10 w-10"/></div>}

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
            <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                {results.map(country => (
                    <Card key={country.name.official}>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">{country.name.common}</CardTitle>
                            <CardDescription>{country.name.official}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border">
                                    <Image src={country.flags.svg} alt={country.flags.alt || `Flag of ${country.name.common}`} layout="fill" objectFit="contain" className="p-2"/>
                                </div>
                                <Button asChild className="w-full">
                                    <a href={country.maps.googleMaps} target="_blank" rel="noopener noreferrer">
                                        <Map className="mr-2"/> View on Google Maps
                                    </a>
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <InfoRow icon={<Landmark />} label="Capital" value={country.capital?.join(', ')} />
                                <InfoRow icon={<Users />} label="Population" value={country.population.toLocaleString()} />
                                <InfoRow icon={<Globe />} label="Region" value={`${country.region} / ${country.subregion}`} />
                                <Separator className="my-2" />
                                <InfoRow icon={<Languages />} label="Languages" value={Object.values(country.languages).join(', ')} />
                                <InfoRow icon={<Coins />} label="Currencies" value={Object.entries(country.currencies).map(([code, c]) => `${c.name} (${c.symbol})`).join(', ')} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
                </div>
            </ScrollArea>
        )}
    </div>
  );
}
