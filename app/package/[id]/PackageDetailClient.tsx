'use client';

import { useState, useRef } from 'react';
import { FileDown, Send } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import PackageView from '@/components/PackageView';
import InquiryModal from '@/components/InquiryModal';
import { Package, Resource, Addon } from '@/lib/db';

interface PackageDetailClientProps {
  pkg: Package;
  resources: Resource[];
  addons: Addon[];
}

export default function PackageDetailClient({
  pkg,
  resources,
  addons,
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

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

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
        />

        {/* Action Buttons */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 mt-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="btn-maroon py-4 px-8 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="h-5 w-5" />
              {isPdfGenerating ? 'Generating...' : 'Download PDF Quote'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsInquiryOpen(true)}
              className="btn-outline py-4 px-8 text-base"
            >
              <Send className="h-4.5 w-4.5" />
              Enquire & Book Package
            </motion.button>
          </div>
        </div>
      </div>

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        packageName={pkg.name}
        packageId={pkg.id}
        type="predefined"
      />

      {/* Hidden PDF Template */}
      <div className="absolute left-[-9999px] top-0 w-[800px] bg-white">
        <div ref={pdfTemplateRef} className="bg-white p-10 select-none">
          <PackageView
            name={pkg.name}
            days={pkg.days}
            addons={pkg.addons}
            autoPrice={pkg.autoPrice}
            finalPrice={pkg.finalPrice}
            resources={resources}
            addonsList={addons}
            isPdfView={true}
          />
        </div>
      </div>

      {/* PDF Generating Overlay */}
      {isPdfGenerating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center max-w-xs">
            <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="font-serif font-bold text-neutral-900 mb-1">Generating PDF Quote...</h3>
            <p className="text-xs text-neutral-500 font-medium">
              Please wait while we render the proposal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
