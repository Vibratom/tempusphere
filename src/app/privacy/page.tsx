
import { Header } from '@/components/tempusphere/Header';
import { Footer } from '@/components/tempusphere/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl">Privacy Policy</CardTitle>
              <p className="text-muted-foreground pt-2">Last Updated: July 29, 2024</p>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none text-lg space-y-4">
                <p>
                    Welcome to Tempusphere. Your privacy is critically important to us. This Privacy Policy outlines how we handle your information when you use our web application.
                </p>

                <h3>1. Data Storage and Privacy</h3>
                <p>
                    <strong>All data you create and manage within Tempusphere is stored exclusively in your web browser's local storage.</strong> This includes your alarms, world clocks, stopwatch laps, timer settings, calendar events, checklist items, and customization preferences.
                </p>
                <p>
                    We do not have a backend server for storing user data. This means:
                </p>
                <ul>
                    <li>We do not collect, see, or have access to any of your personal data.</li>
                    <li>Your information is not transmitted to us or any third party.</li>
                    <li>Your data remains on your device in your browser's designated storage area.</li>
                </ul>
                <p>
                    Since your data is stored locally, clearing your browser's cache or local storage for this site will permanently delete all your settings and saved items. You can use the "Export Data" feature in the Checklist tool to create a manual backup.
                </p>

                <h3>2. Information We Do Not Collect</h3>
                <p>
                    We do not collect any personally identifiable information (PII) such as your name, email address, physical address, or phone number. We do not use cookies for tracking or identification purposes beyond what is necessary for third-party services like advertising.
                </p>

                <h3>3. Third-Party Services (Advertising)</h3>
                <p>
                    We may use third-party advertising companies, such as Google AdSense, to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
                </p>
                <p>
                    Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on their visit to our sites and other sites on the Internet. Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.
                </p>
                
                <h3>4. Children's Privacy</h3>
                <p>
                    Our service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.
                </p>

                <h3>5. Changes to This Privacy Policy</h3>
                <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>

                <h3>6. Contact Us</h3>
                <p>
                    If you have any questions about this Privacy Policy, you can contact us via the information provided on our <a href="/contact">Contact Page</a>.
                </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
