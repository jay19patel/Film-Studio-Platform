'use client';

import { useState, useRef } from 'react';
import { FileDown } from 'lucide-react';
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
    <div className="bg-white min-h-screen relative overflow-hidden">
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

        {/* Action Button */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 mt-10 text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadPdf}
            disabled={isPdfGenerating}
            className="btn-maroon py-4 px-10 text-base font-bold tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <FileDown className="h-5 w-5" />
            {isPdfGenerating ? dict.buildYourOwnPage.downloadingPdf : dict.buildYourOwnPage.downloadPdf}
          </motion.button>
        </div>
      </div>

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        packageName={pkg.name}
        packageId={pkg.id}
        type="predefined"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center max-w-xs">
            <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="font-serif font-bold text-neutral-900 mb-1">{dict.buildYourOwnPage.downloadingPdf}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
