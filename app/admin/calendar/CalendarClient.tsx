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
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn">
      
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
        <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-maroon" />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-white hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 text-gray-600 shadow-sm">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={nextMonth} className="p-2 bg-white hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 text-gray-600 shadow-sm">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6 bg-gray-50/10">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-4">
          {/* Empty slots before 1st day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 md:h-32 rounded-xl bg-gray-50 border border-gray-100/50 opacity-40"></div>
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
                className={`h-24 md:h-32 p-2.5 rounded-xl border transition-all cursor-pointer overflow-hidden flex flex-col ${
                  isToday ? 'border-maroon bg-maroon/5 ring-1 ring-maroon/20' : 'border-gray-200 hover:border-maroon/30 hover:shadow-sm bg-white'
                }`}
              >
                <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1.5 ${isToday ? 'bg-maroon text-white' : 'text-gray-500'}`}>
                  {day}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {dayEvents.map(evt => (
                    <div key={evt.id} className="text-[9px] bg-gray-50 text-gray-700 border border-gray-100 font-bold px-1.5 py-1 rounded-md">
                      <span className="block truncate text-maroon mb-0.5">{evt.clientName}</span>
                      <span className="block truncate opacity-70">{evt.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Panel / Modal for Events (Read Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform border-l border-gray-200 slideInRight">
            
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">Scheduled Events</h3>
                <p className="text-maroon font-bold text-sm">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  <span>Itinerary ({selectedDateEvents.length})</span>
                </h4>
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-gray-500">No shoots scheduled for this day.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateEvents.map(evt => (
                      <div key={evt.id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:border-maroon/40 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-maroon" />
                          <p className="text-sm font-bold text-gray-900">{evt.clientName}</p>
                        </div>
                        <h5 className="font-bold text-gray-600 text-xs mb-3">{evt.title}</h5>
                        {evt.notes && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 font-medium leading-relaxed">
                            {evt.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1">Calendar is Read-Only</p>
                <p className="text-xs font-medium text-blue-600/80">To schedule new shoots, edit dates, or add notes, please navigate to the specific client's profile in the Clients tab.</p>
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fca5a5; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #ef4444; }
      `}} />
    </div>
  );
}
