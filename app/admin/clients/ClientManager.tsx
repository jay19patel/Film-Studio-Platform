'use client';

import { useState } from 'react';
import { Client } from '@/lib/db';
import { Mail, Phone, MapPin, Calendar, Trash2, IndianRupee, ArrowRight, Plus, X, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ClientManager({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Add Client Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    packageName: 'My Custom Wedding Package',
    totalAmount: '',
    status: 'onboarding' as const,
    notes: '',
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name || !newClientForm.email || !newClientForm.phone) {
      toast.error('Please fill in all required fields (Name, Email, Phone).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newClientForm,
          totalAmount: newClientForm.totalAmount ? Number(newClientForm.totalAmount) : 0,
        }),
      });

      if (!res.ok) throw new Error('Failed to create client');

      const createdClient: Client = await res.json();
      setClients([createdClient, ...clients]);
      setIsAddModalOpen(false);
      setNewClientForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        packageName: 'My Custom Wedding Package',
        totalAmount: '',
        status: 'onboarding',
        notes: '',
      });
      toast.success(`Client "${createdClient.name}" added successfully!`);
    } catch (err) {
      toast.error('Failed to create client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      setClients(clients.filter((c) => c.id !== id));
      toast.success('Client deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete client.');
    } finally {
      setClientToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'onboarding':
        return <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Onboarding</span>;
      case 'shooting':
        return <span className="bg-maroon/10 text-maroon border border-maroon/20 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Shooting Phase</span>;
      case 'photo-editing':
        return <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Photo Editing</span>;
      case 'video-editing':
        return <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Video Editing</span>;
      case 'delivered':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">Delivered</span>;
      default:
        return null;
    }
  };

  const formatMoney = (amount: number = 0) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <>
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-admin-surface p-6 rounded-3xl border border-admin-border shadow-black/20">
          <div>
            <h3 className="font-serif text-xl font-bold text-admin-text uppercase tracking-widest">Client Roster</h3>
            <p className="text-xs text-admin-muted font-bold">Total Clients: <span className="text-maroon">{clients.length}</span></p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-maroon hover:bg-maroon-dark text-ink text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Client</span>
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="bg-admin-surface rounded-3xl p-16 text-center border border-admin-border">
            <Calendar className="h-12 w-12 text-admin-muted/40 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-admin-text mb-2">No Active Clients</h3>
            <p className="text-sm font-medium text-admin-muted max-w-md mx-auto mb-6">
              Create clients directly or promote inquiries to manage events and workflow.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-maroon text-ink font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-maroon-dark transition-all inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add First Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {clients.map((client) => {
              const balance = (client.totalAmount || 0) - (client.amountPaid || 0);
              const isFullyPaid = (client.totalAmount || 0) > 0 && balance <= 0;

              return (
                <div
                  key={client.id}
                  className="bg-admin-surface border border-admin-border rounded-3xl p-6 flex flex-col hover:border-maroon/30 hover:shadow-black/30 transition-all relative overflow-hidden group"
                >
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-admin-text uppercase tracking-widest">{client.name}</h3>
                      <p className="text-admin-muted text-xs font-bold tracking-wide mt-0.5">
                        Package: <span className="text-maroon">{client.packageName}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(client.status)}
                      <button
                        onClick={() => setClientToDelete(client.id)}
                        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 cursor-pointer"
                        title="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left: Contact Info */}
                    <div className="space-y-3 border-r border-admin-border pr-4">
                      <div className="flex items-center gap-2.5 text-xs text-admin-muted font-bold">
                        <Mail className="h-3.5 w-3.5 text-admin-muted" /> <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-admin-muted font-bold">
                        <Phone className="h-3.5 w-3.5 text-admin-muted" /> {client.phone}
                      </div>
                      <div className="flex items-start gap-2.5 text-xs text-admin-muted font-bold">
                        <MapPin className="h-3.5 w-3.5 text-admin-muted mt-0.5" /> <span className="line-clamp-2 leading-relaxed">{client.address}</span>
                      </div>
                    </div>

                    {/* Right: Payment & Events Overview */}
                    <div className="space-y-4">
                      {/* Payment Status */}
                      <div className="bg-white/5 rounded-xl p-3 border border-admin-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-admin-muted" />
                          <span className="text-[10px] font-bold text-admin-muted uppercase tracking-widest">Payment</span>
                        </div>
                        {client.totalAmount === 0 || !client.totalAmount ? (
                          <span className="text-xs font-black text-admin-muted">Unset</span>
                        ) : isFullyPaid ? (
                          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                            Paid
                          </span>
                        ) : (
                          <span className="text-xs font-black text-red-400">Bal: {formatMoney(balance)}</span>
                        )}
                      </div>

                      {/* Events Info */}
                      <div className="flex items-center gap-2 text-xs font-bold text-admin-muted uppercase tracking-widest">
                        <Calendar className="h-4 w-4 text-maroon" />
                        {client.events?.length || 0} Events Scheduled
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-auto pt-4 border-t border-admin-border">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="w-full bg-white/5 hover:bg-maroon hover:text-ink text-admin-text font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group/btn"
                    >
                      View Details & Manage{' '}
                      <ArrowRight className="h-4 w-4 text-admin-muted group-hover/btn:text-ink group-hover/btn:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add New Client */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-admin-surface rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl shadow-black/40 border border-admin-border relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-admin-muted rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-admin-text mb-6 uppercase tracking-widest flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-maroon" /> Add Direct Client
            </h3>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@email.com"
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                    className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                  City / Location Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad, Gujarat"
                  value={newClientForm.address}
                  onChange={(e) => setNewClientForm({ ...newClientForm, address: e.target.value })}
                  className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                    Selected Package
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Cinematic Wedding"
                    value={newClientForm.packageName}
                    onChange={(e) => setNewClientForm({ ...newClientForm, packageName: e.target.value })}
                    className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                    Proposal Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={newClientForm.totalAmount}
                    onChange={(e) => setNewClientForm({ ...newClientForm, totalAmount: e.target.value })}
                    className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                  Initial Workflow Status
                </label>
                <select
                  value={newClientForm.status}
                  onChange={(e) => setNewClientForm({ ...newClientForm, status: e.target.value as any })}
                  className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors cursor-pointer"
                >
                  <option value="onboarding">Onboarding</option>
                  <option value="shooting">Shooting Phase</option>
                  <option value="photo-editing">Photo Editing</option>
                  <option value="video-editing">Video Editing</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-admin-muted uppercase tracking-widest mb-1.5">
                  Special Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Event requirements, special requests..."
                  value={newClientForm.notes}
                  onChange={(e) => setNewClientForm({ ...newClientForm, notes: e.target.value })}
                  className="w-full bg-white/5 border border-admin-border text-admin-text rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-maroon transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-maroon hover:bg-maroon-dark text-ink font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Client Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-admin-surface rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl shadow-black/40 border border-admin-border text-center">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-admin-text mb-2">Delete Client?</h3>
            <p className="text-xs font-medium text-admin-muted mb-6">
              Are you sure you want to permanently delete this client? All their scheduled events will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setClientToDelete(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-admin-border text-admin-text font-bold text-xs py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteClient(clientToDelete)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-xl transition-colors"
              >
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
