'use client';

import { useState, useRef } from 'react';
import { FileDown, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import PackageView from '@/components/PackageView';
import PdfProposalTemplate from '@/components/PdfProposalTemplate';
import InquiryModal from '@/components/InquiryModal';
import { Package, Resource, Addon } from '@/lib/db';
import { en } from '@/dictionaries/en';
import { captureHtml2Canvas } from '@/lib/pdfHelper';

interface PackageDetailClientProps {
  pkg: Package;
  resources: Resource[];
  addons: Addon[];
  dict?: typeof en;
}

export default function PackageDetailClient({
  pkg,
  resources,
  addons,
  dict = en,
}: PackageDetailClientProps) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [shouldDownloadPdf, setShouldDownloadPdf] = useState(true);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const element = pdfTemplateRef.current;
      if (!element) return;

      const canvas = await captureHtml2Canvas(element);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CamBuddy_${pkg.name.replace(/\s+/g, '_')}_Proposal.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="bg-paper min-h-screen relative overflow-hidden">
      <div className="py-10 relative z-10">
        <PackageView
          name={pkg.name}
          days={pkg.days}
          addons={pkg.addons}
          autoPrice={pkg.autoPrice}
          finalPrice={pkg.finalPrice}
          resources={resources}
          addonsList={addons}
          showActionBtn={false}
          dict={dict.packageView}
        />

        {/* Action Button & Checkbox */}
        <div className="max-w-md mx-auto px-4 mt-10 space-y-3 text-center">
          <div className="card-elevated p-3.5 rounded-2xl flex items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 text-xs font-bold text-ink/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shouldDownloadPdf}
                onChange={(e) => setShouldDownloadPdf(e.target.checked)}
                className="w-4 h-4 rounded text-maroon focus:ring-maroon accent-maroon cursor-pointer"
              />
              <span>Download PDF Proposal Estimate</span>
            </label>
            <FileDown className="h-4 w-4 text-maroon flex-shrink-0" />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsInquiryOpen(true)}
            className="w-full btn-maroon py-4 px-10 text-base font-bold tracking-wide shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="h-5 w-5" />
            Submit Package Inquiry
          </motion.button>
        </div>
      </div>

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        packageName={pkg.name}
        packageId={pkg.id}
        type="predefined"
        onDownloadPdf={shouldDownloadPdf ? handleDownloadPdf : undefined}
        dict={dict.inquiryModal}
      />

      {/* Hidden Invoice-Style PDF Template (No Images) */}
      <div className="absolute left-[-9999px] top-0 bg-white">
        <div ref={pdfTemplateRef} className="bg-white select-none">
          <PdfProposalTemplate
            name={pkg.name}
            days={pkg.days}
            addons={pkg.addons}
            autoPrice={pkg.autoPrice}
            finalPrice={pkg.finalPrice}
            resources={resources}
            addonsList={addons}
          />
        </div>
      </div>

      {/* PDF Generating Overlay */}
      {isPdfGenerating && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-elevated p-8 rounded-3xl flex flex-col items-center justify-center text-center max-w-xs">
            <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="font-serif font-medium text-ink mb-1">{dict.buildYourOwnPage.downloadingPdf}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
