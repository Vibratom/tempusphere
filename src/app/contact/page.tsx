
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, MessageSquare, LifeBuoy } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-lg space-y-8">
                <p className="text-center text-muted-foreground">
                    We'd love to hear from you! Whether you have a question, a feature request, or feedback, please don't hesitate to get in touch.
                </p>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 pt-1">
                           <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-xl">General Inquiries & Feedback</h3>
                            <p className="text-muted-foreground">For all general questions, feedback, and feature suggestions, email is the best way to reach us.</p>
                            <a href="mailto:simplysub@vibratomstudios.com" className="text-primary hover:underline break-all">simplysub@vibratomstudios.com</a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                         <div className="flex-shrink-0 pt-1">
                           <LifeBuoy className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-xl">Technical Support</h3>
                            <p className="text-muted-foreground">If you're experiencing a technical issue or a bug, please provide as much detail as possible, including your browser and operating system, so we can assist you effectively.</p>
                             <a href="mailto:simplysub@vibratomstudios.com" className="text-primary hover:underline break-all">simplysub@vibratomstudios.com</a>
                        </div>
                    </div>
                </div>

                <p className="text-center text-muted-foreground pt-4">
                    We do our best to respond to all messages within 48 business hours. Thank you for helping us make Tempusphere better!
                </p>

            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
