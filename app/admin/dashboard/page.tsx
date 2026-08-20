'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Package,
  CalendarDays,
  Gem,
  ArrowRight,
  Clock,
  CheckCircle,
  IndianRupee,
  Users,
  Calendar
} from 'lucide-react';
import { Inquiry, Package as DBPackage, Client, ClientEvent } from '@/lib/db';

export default function AdminDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [packages, setPackages] = useState<DBPackage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inqRes, pkgRes, cliRes] = await Promise.all([
          fetch('/api/inquiries'),
          fetch('/api/packages'),
          fetch('/api/clients')
        ]);

        if (!inqRes.ok || !pkgRes.ok || !cliRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        setInquiries(await inqRes.json());
        setPackages(await pkgRes.json());
        setClients(await cliRes.json());
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
  const activeClients = clients.length;
  
  // Compute Financials
  let totalRevenue = 0;
  let totalCollected = 0;
  clients.forEach(c => {
    totalRevenue += (c.totalAmount || 0);
    totalCollected += (c.amountPaid || 0);
  });
  const outstandingBalance = totalRevenue - totalCollected;

  // Compute Upcoming Events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const upcomingEvents: (ClientEvent & { clientName: string, clientId: string })[] = [];
  clients.forEach(c => {
    c.events?.forEach(e => {
      const eDate = new Date(e.date);
      eDate.setHours(0, 0, 0, 0);
      if (eDate.getTime() === today.getTime() || eDate.getTime() === tomorrow.getTime()) {
        upcomingEvents.push({ ...e, clientName: c.name, clientId: c.id });
      }
    });
  });

  upcomingEvents.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatMoney = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-maroon-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-xs font-semibold">Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Welcome Banner */}
      <div className="bg-white text-neutral-900 rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <h3 className="font-serif text-2xl font-bold tracking-widest uppercase mb-2">Hello, Studio Manager!</h3>
          <p className="text-neutral-500 text-xs md:text-sm max-w-xl font-bold tracking-wide">
            You currently have <span className="text-maroon font-black">{pendingLeads} new leads</span> and <span className="text-maroon font-black">{upcomingEvents.length} events</span> in the next 48 hours.
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          <Link href="/admin/inquiries" className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-sm">View Leads</Link>
          <Link href="/admin/clients" className="bg-maroon hover:bg-maroon-dark text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors shadow-sm">Clients Hub</Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-2xl font-bold">
          {error}
        </div>
      )}

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:border-maroon/30 transition-all">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Expected Revenue</span>
            <span className="text-2xl font-black text-gray-900">{formatMoney(totalRevenue)}</span>
          </div>
          <div className="bg-gray-50 text-gray-400 p-4 rounded-2xl border border-gray-100 group-hover:bg-maroon/5 group-hover:text-maroon transition-colors">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:border-emerald-500/30 transition-all">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Collected</span>
            <span className="text-2xl font-black text-emerald-600">{formatMoney(totalCollected)}</span>
          </div>
          <div className="bg-gray-50 text-gray-400 p-4 rounded-2xl border border-gray-100 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:border-red-500/30 transition-all">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Outstanding Balance</span>
            <span className="text-2xl font-black text-red-500">{formatMoney(outstandingBalance)}</span>
          </div>
          <div className="bg-gray-50 text-gray-400 p-4 rounded-2xl border border-gray-100 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column - Upcoming Events */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg font-bold text-gray-900 tracking-widest uppercase flex items-center gap-2">
                <Calendar className="h-5 w-5 text-maroon" />
                Upcoming Events (48h)
              </h3>
              <Link href="/admin/calendar" className="text-xs font-bold text-maroon hover:text-maroon-dark uppercase tracking-widest flex items-center gap-0.5 group">
                Full Calendar <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-bold">No shoots scheduled for today or tomorrow.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((evt, idx) => {
                  const eDate = new Date(evt.date);
                  eDate.setHours(0,0,0,0);
                  const isToday = eDate.getTime() === today.getTime();

                  return (
                    <Link key={`${evt.id}-${idx}`} href={`/admin/clients/${evt.clientId}`} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-maroon/30 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border font-black text-center min-w-[60px] ${isToday ? 'bg-maroon/10 border-maroon/20 text-maroon' : 'bg-white border-gray-200 text-gray-500'}`}>
                          <span className="block text-[9px] uppercase tracking-widest mb-0.5">{isToday ? 'TODAY' : 'TMRW'}</span>
                          <span className="block text-lg leading-none">{eDate.getDate()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 group-hover:text-maroon transition-colors">{evt.clientName}</p>
                          <p className="text-xs font-bold text-gray-500">{evt.title}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-maroon transition-colors" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Quick Actions / Links */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
            <h3 className="font-serif text-lg tracking-widest uppercase font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/admin/clients" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-maroon/5 hover:border-maroon/20 transition-all font-bold text-[11px] uppercase tracking-widest text-gray-700">
                <span className="flex items-center gap-3"><Users className="h-4 w-4 text-maroon" /> Active Clients</span>
                <span className="bg-white border border-gray-200 text-gray-900 px-2 py-1 rounded-md text-xs">{activeClients}</span>
              </Link>

              <Link href="/admin/inquiries" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-maroon/5 hover:border-maroon/20 transition-all font-bold text-[11px] uppercase tracking-widest text-gray-700">
                <span className="flex items-center gap-3"><Inbox className="h-4 w-4 text-maroon" /> New Leads</span>
                <span className="bg-maroon text-white px-2 py-1 rounded-md text-xs">{pendingLeads}</span>
              </Link>
              
              <Link href="/admin/packages" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-maroon/5 hover:border-maroon/20 transition-all font-bold text-[11px] uppercase tracking-widest text-gray-700">
                <Package className="h-4 w-4 text-maroon" /> Manage Packages
              </Link>
              
              <Link href="/admin/resources" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-maroon/5 hover:border-maroon/20 transition-all font-bold text-[11px] uppercase tracking-widest text-gray-700">
                <CalendarDays className="h-4 w-4 text-maroon" /> Resource Day Rates
              </Link>

              <Link href="/admin/addons" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-maroon/5 hover:border-maroon/20 transition-all font-bold text-[11px] uppercase tracking-widest text-gray-700">
                <Gem className="h-4 w-4 text-maroon" /> Add-on Deliverables
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
