import { getDictionary } from '@/lib/dictionaries';
import ContactClient from './ContactClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact Us | CamBuddy Studio',
  description: 'Get in touch with CamBuddy for wedding photography and cinematic film inquiries.',
};

export default async function ContactPage() {
  const dict = await getDictionary();

  return (
    <div className="bg-white min-h-screen pt-24 pb-20 relative overflow-hidden">
      <ContactClient dict={dict} />
    </div>
  );
}
