import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | CamBuddy',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">

        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-ink/50 hover:text-maroon mb-12 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="card-elevated rounded-3xl p-8 md:p-12">
          <h1 className="font-serif text-4xl font-medium text-ink mb-2 uppercase tracking-widest">Terms & Conditions</h1>
          <p className="text-sm font-bold text-ink/40 tracking-wider uppercase mb-8">Last Updated: August 2026</p>

          <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-headings:font-medium prose-headings:text-ink prose-headings:tracking-widest prose-headings:uppercase prose-p:text-ink/60 prose-a:text-maroon prose-a:no-underline hover:prose-a:underline">

            <h3>1. Booking and Payments</h3>
            <p>
              To secure your booking date, a non-refundable deposit (retainer) of 30% of the total package price is required. The remaining balance must be paid in full at least 7 days prior to the event date. In the event of a cancellation, the retainer fee will not be refunded as it covers the administrative costs and securing the date.
            </p>

            <h3>2. Deliverables and Timeline</h3>
            <p>
              Our team works diligently to ensure the highest quality of cinematic films and photographs. The standard delivery time for digital photo galleries is 4-6 weeks after the final event. Cinematic films and teaser videos take approximately 8-12 weeks for completion. Expedited delivery can be requested for an additional fee.
            </p>

            <h3>3. Copyright and Usage</h3>
            <p>
              CamBuddy retains the copyright to all images and video footage created during the event. Clients are granted a personal use license, allowing them to print, share, and post the media online for personal purposes. CamBuddy reserves the right to use selected media for portfolio, marketing, and promotional purposes unless explicitly opted out by the client in a written agreement.
            </p>

            <h3>4. Client Responsibilities</h3>
            <p>
              The client is responsible for securing all necessary permits and approvals for photography and videography at the chosen venues. CamBuddy is not liable for any missed moments resulting from venue restrictions or delays caused by the client or guests.
            </p>

            <h3>5. Force Majeure</h3>
            <p>
              In the unlikely event that CamBuddy cannot perform the duties outlined in the agreement due to fire, casualty, strike, act of God, illness, or other causes beyond our control, we will make every effort to secure a replacement photographer/videographer. If a replacement cannot be found, our liability is limited to a full refund of all payments received.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
