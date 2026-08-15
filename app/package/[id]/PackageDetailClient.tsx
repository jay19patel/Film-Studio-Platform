'use client';

import { useState } from 'react';
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

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <PackageView
        name={pkg.name}
        days={pkg.days}
        addons={pkg.addons}
        autoPrice={pkg.autoPrice}
        finalPrice={pkg.finalPrice}
        resources={resources}
        addonsList={addons}
        showActionBtn={true}
        onAction={() => setIsInquiryOpen(true)}
        actionBtnText="Enquire & Book Package"
      />

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        packageName={pkg.name}
        packageId={pkg.id}
        type="predefined"
      />
    </div>
  );
}
