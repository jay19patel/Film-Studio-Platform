'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Package,
  CalendarDays,
  Gem,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { Inquiry, Package as DBPackage } from '@/lib/db';

export default function AdminDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [packages, setPackages] = useState<DBPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inqRes, pkgRes] = await Promise.all([
          fetch('/api/inquiries'),
          fetch('/api/packages'),
        ]);

        if (!inqRes.ok || !pkgRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const inqData = await inqRes.json();
        const pkgData = await pkgRes.json();

        setInquiries(inqData);
        setPackages(pkgData);
      } catch (err: any) {
        setError(err.message || 'Something went wrong fetching data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute stat counts
  const pendingLeads = inquiries.filter((i) => i.status === 'new').length;
  const contactedLeads = inquiries.filter((i) => i.status === 'contacted').length;
  const completedLeads = inquiries.filter((i) => i.status === 'completed').length;
  const totalPackages = packages.length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="bg-maroon-100 text-maroon-800 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">New Lead</span>;
      case 'contacted':
        return <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Contacted</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Completed</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-maroon-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-xs font-semibold">Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-white text-neutral-900 rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full blur-2xl" />
        <h3 className="font-serif text-2xl font-bold tracking-widest uppercase mb-2">Hello, Studio Manager!</h3>
        <p className="text-neutral-500 text-xs md:text-sm max-w-xl font-bold tracking-wide">
          Here is the summary of package inquiries and leads. You currently have <span className="text-maroon font-black">{pendingLeads} new inquiries</span> waiting for action.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-2xl font-bold">
          {error}
        </div>
      )}

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Pending Leads */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="bg-maroon/10 text-maroon p-3.5 rounded-2xl border border-maroon/20">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">New Leads</span>
            <span className="text-2xl font-black text-gray-900">{pendingLeads}</span>
          </div>
        </div>

        {/* Contacted Leads */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl border border-blue-100">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Contacted</span>
            <span className="text-2xl font-black text-gray-900">{contactedLeads}</span>
          </div>
        </div>

        {/* Completed Bookings */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl border border-emerald-100">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Completed</span>
            <span className="text-2xl font-black text-gray-900">{completedLeads}</span>
          </div>
        </div>

        {/* Predefined Packages */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl border border-purple-100">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Packages</span>
            <span className="text-2xl font-black text-gray-900">{totalPackages}</span>
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column - Recent inquiries */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg font-bold text-gray-900 tracking-widest uppercase flex items-center gap-2">
              <Inbox className="h-5 w-5 text-maroon" />
              Recent Client Inquiries
            </h3>
            <Link
              href="/admin/inquiries"
              className="text-xs font-bold text-maroon hover:text-maroon-dark uppercase tracking-widest flex items-center gap-0.5 group"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Inbox className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-bold">No inquiries received yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Package Selected</th>
                    <th className="pb-3">Date Submitted</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inquiries.slice(0, 5).map((inq) => (
                    <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 pr-3">
                        <p className="font-bold text-gray-900">{inq.name}</p>
                        <p className="text-gray-500 text-xs font-bold">{inq.phone}</p>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md inline-block ${
                          inq.type === 'custom'
                            ? 'bg-maroon/10 text-maroon border border-maroon/20'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {inq.packageName}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-500 font-bold text-xs pr-3">
                        {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5">{getStatusBadge(inq.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column - Quick Actions / Links */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
            <h3 className="font-serif text-lg tracking-widest uppercase font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link
                href="/admin/packages"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-maroon/5 hover:border-maroon/20 transition-all font-bold text-[11px] uppercase tracking-widest text-gray-700"
              >
                <Package className="h-4 w-4 text-maroon" />
                Manage Packages
              </Link>
              
              <Link
                href="/admin/resources"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-maroon/5 hover:border-maroon/20 transition-all font-bold text-[11px] uppercase tracking-widest text-gray-700"
              >
                <CalendarDays className="h-4 w-4 text-maroon" />
                Manage Resource Day Rates
              </Link>

              <Link
                href="/admin/addons"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-maroon/5 hover:border-maroon/20 transition-all font-bold text-[11px] uppercase tracking-widest text-gray-700"
              >
                <Gem className="h-4 w-4 text-maroon" />
                Manage Add-on Deliverables
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
