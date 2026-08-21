'use client';

import { useState } from 'react';
import { ClientEvent } from '@/lib/db';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Clock, User } from 'lucide-react';

export default function CalendarClient({ initialEvents }: { initialEvents: (ClientEvent & { clientName: string, clientId: string })[] }) {
  const [events] = useState<(ClientEvent & { clientName: string, clientId: string })[]>(initialEvents);

  // Date State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDayClick = (day: number) => {
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
    setIsModalOpen(true);
  };

  const getEventsForDay = (day: number) => {
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === formattedDate);
  };

  const selectedDateEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

  return (
    <div className="bg-admin-surface rounded-3xl border border-admin-border overflow-hidden animate-fadeIn">

      {/* Calendar Header */}
      <div className="p-3.5 sm:p-6 border-b border-admin-border flex items-center justify-between bg-white/[0.02] gap-2">
        <h3 className="font-serif text-sm sm:text-xl font-bold text-admin-text flex items-center gap-1.5 sm:gap-2 truncate">
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-maroon flex-shrink-0" />
          <span className="truncate">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-admin-border text-admin-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={nextMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-admin-border text-admin-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2.5 sm:p-6">
        <div className="grid grid-cols-7 gap-1 sm:gap-4 mb-2 sm:mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-admin-muted">
              <span className="sm:hidden">{day.slice(0, 1)}</span>
              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-4">
          {/* Empty slots before 1st day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-14 sm:h-24 md:h-32 rounded-lg sm:rounded-xl bg-white/[0.02] border border-admin-border opacity-40"></div>
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`h-14 sm:h-24 md:h-32 p-1 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer overflow-hidden flex flex-col ${
                  isToday ? 'border-maroon bg-maroon/10 ring-1 ring-maroon/20' : 'border-admin-border hover:border-maroon/30 bg-white/[0.02]'
                }`}
              >
                <div className={`text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center rounded-full mb-0.5 sm:mb-1.5 flex-shrink-0 ${isToday ? 'bg-maroon text-ink' : 'text-admin-muted'}`}>
                  {day}
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 sm:space-y-1.5 pr-0.5 sm:pr-1 custom-scrollbar">
                  {dayEvents.map(evt => (
                    <div key={evt.id} className="hidden sm:block text-[9px] bg-white/5 text-admin-muted border border-admin-border font-bold px-1.5 py-1 rounded-md">
                      <span className="block truncate text-maroon mb-0.5">{evt.clientName}</span>
                      <span className="block truncate opacity-70">{evt.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 0 && (
                    <div className="sm:hidden w-1.5 h-1.5 rounded-full bg-maroon mx-auto" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Panel / Modal for Events (Read Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className="w-full max-w-sm bg-admin-surface h-full shadow-2xl shadow-black/40 flex flex-col transform transition-transform border-l border-admin-border slideInRight">

            <div className="p-6 border-b border-admin-border flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="font-serif text-lg font-bold text-admin-text">Scheduled Events</h3>
                <p className="text-maroon font-bold text-sm">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-admin-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

              <div>
                <h4 className="text-xs font-bold text-admin-muted uppercase tracking-widest mb-4 flex items-center justify-between">
                  <span>Itinerary ({selectedDateEvents.length})</span>
                </h4>
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-10 bg-white/[0.02] rounded-3xl border border-dashed border-admin-border">
                    <Clock className="h-10 w-10 text-admin-muted/40 mx-auto mb-3" />
                    <p className="text-xs font-bold text-admin-muted">No shoots scheduled for this day.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateEvents.map(evt => (
                      <div key={evt.id} className="bg-white/[0.02] border border-admin-border p-5 rounded-2xl hover:border-maroon/40 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-maroon" />
                          <p className="text-sm font-bold text-admin-text">{evt.clientName}</p>
                        </div>
                        <h5 className="font-bold text-admin-muted text-xs mb-3">{evt.title}</h5>
                        {evt.notes && (
                          <div className="text-xs text-admin-muted bg-white/5 p-3 rounded-xl border border-admin-border font-medium leading-relaxed">
                            {evt.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Calendar is Read-Only</p>
                <p className="text-xs font-medium text-blue-300/70">To schedule new shoots, edit dates, or add notes, please navigate to the specific client's profile in the Clients tab.</p>
              </div>

            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .slideInRight { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(180, 134, 58, 0.4); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(180, 134, 58, 0.7); }
      `}} />
    </div>
  );
}
