'use client';

import { useState } from 'react';
import { Client } from '@/lib/db';
import { Mail, Phone, MapPin, Calendar, Clock, Edit, Trash2, IndianRupee, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ClientManager({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const handleDeleteClient = async (id: string) => {
    try {
      await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      setClients(clients.filter(c => c.id !== id));
      toast.success('Client deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete client.');
    } finally {
      setClientToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'onboarding': return <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Onboarding</span>;
      case 'shooting': return <span className="bg-maroon/10 text-maroon font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Shooting Phase</span>;
      case 'photo-editing': return <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Photo Editing</span>;
      case 'video-editing': return <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Video Editing</span>;
      case 'delivered': return <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Delivered</span>;
      default: return null;
    }
  };

  const formatMoney = (amount: number = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <>
      <div className="space-y-6 animate-fadeIn pb-10">
        
        {clients.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">No Active Clients</h3>
            <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">Promote inquiries to clients to start managing their events and workflow.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {clients.map(client => {
              const balance = (client.totalAmount || 0) - (client.amountPaid || 0);
              const isFullyPaid = (client.totalAmount || 0) > 0 && balance <= 0;

              return (
                <div key={client.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                  
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-gray-900 uppercase tracking-widest">{client.name}</h3>
                      <p className="text-gray-500 text-xs font-bold tracking-wide mt-0.5">Package: <span className="text-maroon">{client.packageName}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(client.status)}
                      <button 
                        onClick={() => setClientToDelete(client.id)}
                        className="p-1.5 bg-gray-50 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
                        title="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left: Contact Info */}
                    <div className="space-y-3 border-r border-gray-50 pr-4">
                      <div className="flex items-center gap-2.5 text-xs text-gray-600 font-bold">
                        <Mail className="h-3.5 w-3.5 text-gray-400" /> <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-600 font-bold">
                        <Phone className="h-3.5 w-3.5 text-gray-400" /> {client.phone}
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-gray-600 font-bold">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" /> <span className="line-clamp-2 leading-relaxed">{client.address}</span>
                      </div>
                    </div>

                    {/* Right: Payment & Events Overview */}
                    <div className="space-y-4">
                      
                      {/* Payment Status */}
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Payment</span>
                        </div>
                        {client.totalAmount === 0 || !client.totalAmount ? (
                          <span className="text-xs font-black text-gray-400">Unset</span>
                        ) : isFullyPaid ? (
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">Paid</span>
                        ) : (
                          <span className="text-xs font-black text-red-500">Bal: {formatMoney(balance)}</span>
                        )}
                      </div>

                      {/* Events Info */}
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <Calendar className="h-4 w-4 text-maroon" /> 
                        {client.events?.length || 0} Events Scheduled
                      </div>

                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link 
                      href={`/admin/clients/${client.id}`}
                      className="w-full bg-gray-50 hover:bg-maroon hover:text-white text-gray-700 font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group/btn"
                    >
                      View Details & Manage <ArrowRight className="h-4 w-4 text-gray-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Delete Client Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Delete Client?</h3>
            <p className="text-xs font-medium text-gray-500 mb-6">Are you sure you want to permanently delete this client? All their scheduled events will be lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setClientToDelete(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleDeleteClient(clientToDelete)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm">Delete Client</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
