
'use client';

import { useState, FormEvent } from 'react';
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Facebook, Youtube, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const url = 'https://docs.google.com/forms/d/e/1FAIpQLScVVC-31bCi2OpbjvKDvCAziOvfCQHMzsBPU5bT9R2nYUrmQA/formResponse';
        
        try {
            await fetch(url, {
                method: 'POST',
                body: formData,
                mode: 'no-cors' // Important: This prevents CORS errors, but you won't get a response back.
            });
            setSubmitted(true);
        } catch (e) {
            console.error('Form submission error:', e);
            setError('There was an error submitting the form. Please try again or email us directly.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const XIcon = () => (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="currentColor"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 23.847h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.931L18.901 1.153ZM17.61 21.644h2.039L6.486 3.24H4.298l13.312 18.404Z"></path></svg>
    )

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
          <section className="py-20 md:py-24 bg-muted/50">
              <div className="container max-w-7xl text-center">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Let's Connect</h1>
                  <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">We’d love to hear from you. Whether you have a question, a proposal, or just want to say hello, feel free to reach out.</p>
              </div>
          </section>

          <section className="py-16 md:py-24">
              <div className="container max-w-7xl">
                  <div className="grid md:grid-cols-2 gap-16">
                      
                      <Card>
                          <CardHeader>
                              <CardTitle className="font-headline text-2xl">Send Us a Message</CardTitle>
                              <CardDescription>We'll get back to you within 48 hours.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              {submitted ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <Mail className="h-16 w-16 text-primary mb-4"/>
                                    <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                                    <p className="text-muted-foreground">Your message has been sent successfully. We appreciate you reaching out.</p>
                                </div>
                              ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" placeholder="Enter your name" required name="entry.1726207690" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input type="email" id="email" placeholder="Enter your email" required name="entry.1391742132" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="inquiry-type">Reason for Contact</Label>
                                            <Select name="entry.1367270036" required>
                                                <SelectTrigger id="inquiry-type">
                                                    <SelectValue placeholder="Select a reason" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                                                    <SelectItem value="Technical Support">Technical Support</SelectItem>
                                                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                                                    <SelectItem value="Partnership">Partnership</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message</Label>
                                            <Textarea id="message" name="entry.1895419197" placeholder="Your message" rows={5} required />
                                        </div>
                                        <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </Button>
                                        {error && <p className="text-destructive text-sm text-center">{error}</p>}
                                    </div>
                                </form>
                              )}
                          </CardContent>
                      </Card>

                      <div className="space-y-8">
                          <div>
                              <h2 className="font-headline text-3xl font-bold mb-4">Contact Information</h2>
                              <p className="text-muted-foreground text-lg mb-6">Find us through any of these channels. We're ready to help.</p>
                              <div className="space-y-4">
                                  <a href="mailto:simplysub@vibratomstudios.com" className="flex items-center gap-4 text-lg hover:text-primary transition-colors">
                                      <Mail className="h-6 w-6 text-primary" />
                                      <span>simplysub@vibratomstudios.com</span>
                                  </a>
                              </div>
                          </div>
                          
                          <div className="border-t border-border pt-8">
                              <h3 className="font-headline text-2xl font-bold mb-4">Follow Us</h3>
                              <div className="flex space-x-6">
                                  <a target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" href="https://x.com/Vibratomstudios">
                                    <span className="sr-only">X</span><XIcon />
                                  </a>
                                  <a target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" href="#">
                                    <span className="sr-only">LinkedIn</span><Linkedin className="h-7 w-7" />
                                  </a>
                                  <a target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" href="#">
                                    <span className="sr-only">Instagram</span><Instagram className="h-7 w-7" />
                                  </a>
                                  <a target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" href="https://www.facebook.com/profile.php?id=61579646790672">
                                    <span className="sr-only">Facebook</span><Facebook className="h-7 w-7" />
                                  </a>
                                  <a target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" href="https://www.youtube.com/@vibratomstudios">
                                    <span className="sr-only">YouTube</span><Youtube className="h-7 w-7" />
                                  </a>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      </main>
      <Footer />
    </div>
  );
}
