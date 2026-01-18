"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar as CalendarIcon,
  LayoutDashboard,
  ListTodo,
  User,
  Camera,
  Scale,
  Ruler,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

// Types
type Habit = {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
};

type CompletionData = {
  [date: string]: { [habitId: string]: boolean };
};

type UserProfile = {
  name: string;
  photo: string;
  weight: string;
  height: string;
};

export default function HabitTracker() {
  // State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<CompletionData>({});
  const [profile, setProfile] = useState<UserProfile>({ name: "", photo: "", weight: "", height: "" });
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'monthly' | 'daily'>('monthly'); // Default to monthly
  const [mounted, setMounted] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    setMounted(true);
    const savedHabits = localStorage.getItem("habits");
    const savedCompletions = localStorage.getItem("completions");
    const savedProfile = localStorage.getItem("userProfile");
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  // Update the page title dynamically if needed, though metadata handles the initial load
  useEffect(() => {
    document.title = "Tracker";
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("habits", JSON.stringify(habits));
      localStorage.setItem("completions", JSON.stringify(completions));
      localStorage.setItem("userProfile", JSON.stringify(profile));
    }
  }, [habits, completions, profile, mounted]);

  // Helpers
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const todayDate = new Date();
  const todayStr = formatDate(todayDate);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500"];
    const icons = ["🧘", "📚", "💧", "💪", "🍎", "🏃", "💻"];
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: newHabitName,
      color: colors[habits.length % colors.length],
      icon: icons[habits.length % icons.length],
      createdAt: new Date().toISOString(),
    };
    setHabits([...habits, newHabit]);
    setNewHabitName("");
    setIsAddingHabit(false);
    setView('daily'); // Switch to daily to see the new habit
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleCompletion = (habitId: string, date: string) => {
    setCompletions(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [habitId]: !prev[date]?.[habitId]
      }
    }));
  };

  // Analytics Calculations
  const analyticsData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const completed = Object.values(completions[dateStr] || {}).filter(Boolean).length;
      return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), completed };
    }).reverse();

    const totalPossible = habits.length * 30;
    let totalCompleted = 0;
    Object.values(completions).forEach(day => {
      totalCompleted += Object.values(day).filter(Boolean).length;
    });

    const pieData = [
      { name: 'Completed', value: totalCompleted },
      { name: 'Remaining', value: Math.max(0, totalPossible - totalCompleted) }
    ];

    return { last7Days, pieData };
  }, [habits, completions]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Helper to get day name
  const getDayName = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Helper to check if a date is in the past (before today)
  const isPastDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-white">
        
        {/* Dashboard Header & Analytics */}
        <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm hover:ring-4 hover:ring-blue-500/10 transition-all"
              >
                {profile.photo ? (
                  <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </button>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {profile.name ? `Welcome, ${profile.name}` : "My Progress"}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  {profile.weight && (
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Scale className="w-3 h-3" /> {profile.weight}kg
                    </span>
                  )}
                  {profile.height && (
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Ruler className="w-3 h-3" /> {profile.height}cm
                    </span>
                  )}
                  {!profile.name && (
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Set up profile
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start">
              <button 
                onClick={() => setView('monthly')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                  view === 'monthly' ? "bg-white shadow-md text-blue-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <CalendarIcon className="w-4 h-4" /> Monthly
              </button>
              <button 
                onClick={() => setView('daily')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                  view === 'daily' ? "bg-white shadow-md text-blue-600" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ListTodo className="w-4 h-4" /> Daily Tasks
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" /> Weekly Activity
                </h3>
              </div>
              <div className="h-48 w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.last7Days}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#94a3b8'}} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}} 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} 
                      />
                      <Bar dataKey="completed" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-500" /> 30-Day Goal
              </h3>
              <div className="flex-1 relative">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">
                    {Math.round((analyticsData.pieData[0].value / (habits.length * 30 || 1)) * 100)}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-8">
          {view === 'monthly' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black text-slate-800">{monthName}</h2>
                  <div className="flex bg-slate-100 rounded-xl p-1">
                    <button 
                      onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                      className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    ><ChevronLeft className="w-4 h-4" /></button>
                    <button 
                      onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                      className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    ><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
                <button 
                  onClick={() => { setView('daily'); setIsAddingHabit(true); }}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  <Plus className="w-4 h-4" /> New Habit
                </button>
              </div>

              <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/60">
                        <th className="p-6 font-bold text-xs text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10 min-w-[160px]">Habit</th>
                        {Array.from({ length: daysInMonth }, (_, i) => (
                          <th key={i} className="p-2 text-center min-w-[48px]">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase">{getDayName(i + 1)}</span>
                              <span className="text-xs font-black text-slate-600">{i + 1}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {habits.map(habit => (
                        <tr key={habit.id} className="group hover:bg-white/50 transition-colors">
                          <td className="p-6 sticky left-0 bg-slate-50 group-hover:bg-white/80 z-10 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{habit.icon}</span>
                              <span className="font-bold text-slate-700 truncate max-w-[120px]">{habit.name}</span>
                            </div>
                          </td>
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const date = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1));
                            const isCompleted = completions[date]?.[habit.id];
                            const isPast = isPastDate(i + 1);
                            
                            return (
                              <td key={i} className="p-1.5 text-center">
                                <button 
                                  onClick={() => toggleCompletion(habit.id, date)}
                                  className={cn(
                                    "w-8 h-8 rounded-lg transition-all flex items-center justify-center border-2 relative",
                                    isCompleted 
                                      ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200" 
                                      : isPast 
                                        ? "bg-slate-100 border-slate-200 text-slate-300" 
                                        : "bg-white border-slate-200 hover:border-blue-300"
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : isPast ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-4 h-[2px] bg-slate-300 rotate-45 absolute" />
                                      <div className="w-4 h-[2px] bg-slate-300 -rotate-45 absolute" />
                                    </div>
                                  ) : null}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {habits.length === 0 && (
                        <tr>
                          <td colSpan={daysInMonth + 1} className="p-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <CalendarIcon className="w-8 h-8 text-slate-300" />
                              </div>
                              <p className="text-slate-400 font-bold">No habits tracked yet.</p>
                              <button 
                                onClick={() => { setView('daily'); setIsAddingHabit(true); }}
                                className="text-blue-600 font-bold text-sm hover:underline"
                              >Create your first habit</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800">Daily Tasks</h2>
                <button 
                  onClick={() => setIsAddingHabit(true)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>

              <div className="grid gap-4">
                {habits.map(habit => (
                  <div key={habit.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="flex items-center gap-5">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm", habit.color, "bg-opacity-10")}>
                        {habit.icon}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800">{habit.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Goal</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => deleteHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => toggleCompletion(habit.id, todayStr)}
                        className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-4",
                          completions[todayStr]?.[habit.id] 
                            ? "bg-green-500 border-green-100 text-white scale-110 shadow-lg shadow-green-200" 
                            : "bg-white border-slate-100 text-slate-200 hover:border-blue-100 hover:text-blue-200"
                        )}
                      >
                        <CheckCircle2 className="w-8 h-8" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-white">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900">Profile Settings</h3>
              <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {profile.photo ? (
                      <img src={profile.photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setProfile({ ...profile, photo: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Display Name</label>
                <input 
                  type="text" 
                  placeholder="Your Name"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-700"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Weight (kg)</label>
                  <input 
                    type="number" 
                    placeholder="70"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-700"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Height (cm)</label>
                  <input 
                    type="number" 
                    placeholder="175"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-700"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  />
                </div>
              </div>

              <button 
                onClick={() => setIsEditingProfile(false)}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Habit Modal */}
      {isAddingHabit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-white">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900">New Habit</h3>
              <button onClick={() => setIsAddingHabit(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Habit Name</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="e.g. Morning Yoga"
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-700"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                />
              </div>
              <button 
                onClick={addHabit}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]"
              >
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
