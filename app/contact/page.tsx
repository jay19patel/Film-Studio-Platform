import { getDictionary } from '@/lib/dictionaries';
import ContactClient from './ContactClient';
import PageHero from '@/components/PageHero';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact Us | CamBuddy Studio',
  description: 'Get in touch with CamBuddy for wedding photography and cinematic film inquiries.',
};

export default async function ContactPage() {
  const dict = await getDictionary();

  return (
    <div className="bg-paper min-h-screen pb-20 relative overflow-hidden">
      <PageHero
        eyebrow="Get In Touch"
        title={dict.contactPage.title}
        accent={dict.contactPage.titleAccent}
        subtitle={dict.contactPage.subtitle}
      />
      <ContactClient dict={dict} />
    </div>
  );
}
