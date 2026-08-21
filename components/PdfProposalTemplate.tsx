'use client';

import React, { useState, useEffect } from 'react';
import { PackageDay, Resource, Addon } from '@/lib/db';

interface PdfProposalTemplateProps {
  name: string;
  days: PackageDay[];
  addons: string[];
  autoPrice: number;
  finalPrice: number;
  resources: Resource[];
  addonsList: Addon[];
}

export default function PdfProposalTemplate({
  name,
  days,
  addons,
  autoPrice,
  finalPrice,
  resources,
  addonsList,
}: PdfProposalTemplateProps) {
  const [proposalDate, setProposalDate] = useState('21 Aug 2026');
  const [refNumber, setRefNumber] = useState('CB-QUO-88210');

  useEffect(() => {
    setProposalDate(
      new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
    setRefNumber(`CB-QUO-${Math.floor(10000 + Math.random() * 90000)}`);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const getResourceName = (id: string) => {
    const res = resources.find((r) => r.id === id);
    return res ? res.name : id;
  };

  const getResourcePrice = (id: string) => {
    const res = resources.find((r) => r.id === id);
    return res ? res.pricePerDay : 0;
  };

  const selectedAddonObjects = addonsList.filter((a) => addons.includes(a.id));

  return (
    <div
      style={{
        width: '794px',
        padding: '36px',
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px',
        lineHeight: '1.5',
        boxSizing: 'border-box',
      }}
    >
      {/* Invoice Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '20px', marginBottom: '24px', borderBottom: '2px solid #8B1A2B' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#8B1A2B', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>
            CAMBUDDY STUDIOS
          </h1>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#4B5563', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
            Luxury Wedding Photography & Cinematic Films
          </p>
          <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>
            Ahmedabad, Gujarat, India | hello@cambuddy.com | +91 98765 43210
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#8B1A2B', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '6px 14px', borderRadius: '4px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            OFFICIAL QUOTATION
          </div>
          <p style={{ fontSize: '12px', color: '#374151', margin: '2px 0 0 0', fontWeight: '600' }}>
            Ref #: <strong style={{ color: '#111827' }} suppressHydrationWarning>{refNumber}</strong>
          </p>
          <p style={{ fontSize: '12px', color: '#374151', margin: '2px 0 0 0', fontWeight: '600' }}>
            Date: <strong style={{ color: '#111827' }} suppressHydrationWarning>{proposalDate}</strong>
          </p>
        </div>
      </div>

      {/* Package Info Card */}
      <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
            PROPOSAL PREPARED FOR
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>
            {name}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
            COVERAGE DURATION
          </span>
          <span style={{ fontSize: '14px', fontWeight: '800', color: '#8B1A2B' }}>
            {days.length} {days.length === 1 ? 'Event Day' : 'Event Days'}
          </span>
        </div>
      </div>

      {/* Section 1: Event Schedule Table */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px', paddingBottom: '6px', marginBottom: '12px', borderBottom: '1px solid #D1D5DB' }}>
          1. EVENT SCHEDULE & CREATIVE CREW BREAKDOWN
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F3F4F6', color: '#374151', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', borderTop: '1px solid #D1D5DB', borderBottom: '1px solid #D1D5DB' }}>
              <th style={{ padding: '10px 12px', width: '32%' }}>Event / Ceremony</th>
              <th style={{ padding: '10px 12px' }}>Assigned Crew & Gear</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', width: '10%' }}>Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', width: '18%' }}>Daily Rate</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', width: '18%' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, dIdx) => (
              <React.Fragment key={dIdx}>
                {day.items.map((item, iIdx) => {
                  const unitPrice = getResourcePrice(item.resourceId);
                  const subtotal = unitPrice * item.qty;
                  return (
                    <tr key={iIdx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      {iIdx === 0 ? (
                        <td
                          rowSpan={day.items.length}
                          style={{
                            padding: '12px',
                            fontWeight: '700',
                            color: '#111827',
                            verticalAlign: 'top',
                            backgroundColor: '#F9FAFB',
                            borderRight: '1px solid #E5E7EB',
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>
                            {day.title}
                          </div>
                          <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '600' }}>
                            Day {dIdx + 1}
                          </span>
                        </td>
                      ) : null}
                      <td style={{ padding: '10px 12px', fontWeight: '600', color: '#1F2937' }}>
                        {getResourceName(item.resourceId)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', color: '#111827' }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#4B5563', fontWeight: '500' }}>
                        ₹ {formatPrice(unitPrice)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#111827' }}>
                        ₹ {formatPrice(subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Deliverables & Fine Art Albums */}
      {selectedAddonObjects.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px', paddingBottom: '6px', marginBottom: '12px', borderBottom: '1px solid #D1D5DB' }}>
            2. PHYSICAL DELIVERABLES & FINE ART ALBUMS
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6', color: '#374151', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', borderTop: '1px solid #D1D5DB', borderBottom: '1px solid #D1D5DB' }}>
                <th style={{ padding: '8px 12px' }}>Deliverable / Product Item</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', width: '20%' }}>Status</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', width: '25%' }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {selectedAddonObjects.map((addon) => (
                <tr key={addon.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1F2937' }}>
                    {addon.name}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#059669', fontWeight: '700', fontSize: '11px' }}>
                    INCLUDED
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: '#111827' }}>
                    ₹ {formatPrice(addon.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 3: Quotation Summary Box */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: '16px', borderTop: '2px solid #E5E7EB' }}>
        <div style={{ maxWidth: '340px', fontSize: '11px', color: '#4B5563', lineHeight: '1.6' }}>
          <p style={{ fontWeight: '800', color: '#111827', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px', marginBottom: '4px' }}>
            TERMS & BOOKING POLICY
          </p>
          <p style={{ margin: '0 0 3px 0' }}>• 50% advance deposit to confirm dates & creative team.</p>
          <p style={{ margin: '0 0 3px 0' }}>• Final photos & 4K films delivered on High-Speed SSD Drive.</p>
          <p style={{ margin: 0 }}>• Quote inclusive of all local studio crew travel expenses.</p>
        </div>

        <div style={{ width: '300px', backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4B5563', marginBottom: '8px' }}>
            <span>Estimated Subtotal:</span>
            <span>₹ {formatPrice(autoPrice)}</span>
          </div>

          {autoPrice > finalPrice && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>
              <span>Special Discount:</span>
              <span>- ₹ {formatPrice(autoPrice - finalPrice)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '2px solid #8B1A2B' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#111827' }}>
              TOTAL PROPOSAL QUOTE:
            </span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#8B1A2B' }}>
              ₹ {formatPrice(finalPrice)}/-
            </span>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div style={{ marginTop: '28px', paddingTop: '12px', borderTop: '1px solid #E5E7EB', textAlign: 'center', fontSize: '10px', color: '#9CA3AF' }}>
        Thank you for considering CamBuddy Studios. This is an official digital quotation proposal.
      </div>
    </div>
  );
}
