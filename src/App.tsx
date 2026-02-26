import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Users, 
  Trophy, 
  RefreshCw, 
  Trash2, 
  Plus, 
  ChevronRight,
  LayoutGrid,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type Tab = 'input' | 'draw' | 'group';

interface Person {
  id: string;
  name: string;
}

// --- Components ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('input');
  const [people, setPeople] = useState<Person[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Prize Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Person | null>(null);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [remainingPeople, setRemainingPeople] = useState<Person[]>([]);
  const [drawHistory, setDrawHistory] = useState<Person[]>([]);

  // Grouping State
  const [groupSize, setGroupSize] = useState(3);
  const [groups, setGroups] = useState<Person[][]>([]);

  // Sync remaining people when people list changes
  useEffect(() => {
    setRemainingPeople(people);
    setDrawHistory([]);
    setWinner(null);
  }, [people]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const names = results.data
          .flat()
          .map((n: any) => String(n).trim())
          .filter(n => n.length > 0);
        
        const newPeople = names.map(name => ({
          id: Math.random().toString(36).substr(2, 9),
          name
        }));
        setPeople(prev => [...prev, ...newPeople]);
      },
      header: false
    });
  };

  const addFromText = () => {
    const names = inputText
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    const newPeople = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name
    }));
    setPeople(prev => [...prev, ...newPeople]);
    setInputText('');
  };

  const clearList = () => {
    if (confirm("確定要清除所有名單嗎？")) {
      setPeople([]);
      setDrawHistory([]);
      setWinner(null);
    }
  };

  const startDraw = () => {
    if (isDrawing) return;
    
    const pool = allowRepeat ? people : remainingPeople;
    if (pool.length === 0) {
      alert("名單已空！");
      return;
    }

    setIsDrawing(true);
    setWinner(null);

    // Animation duration
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        setWinner(pool[randomIndex]);
        requestAnimationFrame(animate);
      } else {
        const finalIndex = Math.floor(Math.random() * pool.length);
        const selected = pool[finalIndex];
        setWinner(selected);
        setIsDrawing(false);
        
        if (!allowRepeat) {
          setRemainingPeople(prev => prev.filter(p => p.id !== selected.id));
        }
        setDrawHistory(prev => [selected, ...prev]);
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#000000', '#ffffff', '#22c55e', '#facc15']
        });
      }
    };

    animate();
  };

  const generateGroups = () => {
    if (people.length === 0) return;
    
    const shuffled = [...people].sort(() => Math.random() - 0.5);
    const newGroups: Person[][] = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push(shuffled.slice(i, i + groupSize));
    }
    
    setGroups(newGroups);
    
    // Small success feedback
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#000000', '#22c55e']
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] p-4 md:p-12 selection:bg-black selection:text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-display font-black text-2xl italic shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
              >
                D
              </motion.div>
              <div className="flex flex-col">
                <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-[0.85] text-stroke">
                  DRAW
                </h1>
                <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-[0.85] -mt-2">
                  & GROUP
                </h1>
              </div>
            </div>
            <p className="text-zinc-500 font-medium tracking-tight text-lg max-w-md leading-relaxed">
              <span className="text-black font-bold">專業活動組織工具。</span> 專為設計師、教育工作者與創意團隊打造的高效抽籤與隨機分組系統。
            </p>
          </div>
          
          <nav className="flex flex-wrap gap-2 p-2 bg-zinc-200/40 backdrop-blur-xl rounded-[2rem] w-fit border border-black/5">
            {(['input', 'draw', 'group'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-10 py-4 rounded-[1.5rem] text-sm font-black transition-all uppercase tracking-[0.15em] relative",
                  activeTab === tab 
                    ? "bg-black text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] scale-105 z-10" 
                    : "text-zinc-500 hover:text-black hover:bg-white/60"
                )}
              >
                {tab === 'input' && '名單來源'}
                {tab === 'draw' && '獎品抽籤'}
                {tab === 'group' && '自動分組'}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-black rounded-[1.5rem] -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {/* TAB: INPUT */}
            {activeTab === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                <div className="lg:col-span-7 space-y-10">
                  <div className="brutal-border bg-white p-10 rounded-[2.5rem]">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-display font-black uppercase italic flex items-center gap-4">
                        <span className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-black"><Upload size={20} /></span>
                        上傳 CSV 名單
                      </h2>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full border border-black/5">Step 01</span>
                    </div>
                    <div className="border-2 border-dashed border-zinc-200 rounded-[2rem] p-16 text-center hover:border-black hover:bg-zinc-50/50 transition-all group relative cursor-pointer overflow-hidden">
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      />
                      <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all duration-500">
                        <Upload size={32} />
                      </div>
                      <p className="text-2xl font-black uppercase italic tracking-tight">點擊或拖拽 CSV 檔案</p>
                      <p className="text-zinc-400 mt-3 font-medium">支援所有標準 CSV 格式，系統將自動解析姓名</p>
                      
                      {/* Decorative elements */}
                      <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Upload size={120} />
                      </div>
                    </div>
                  </div>

                  <div className="brutal-border bg-white p-10 rounded-[2.5rem]">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-display font-black uppercase italic flex items-center gap-4">
                        <span className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-black"><Plus size={20} /></span>
                        手動貼上姓名
                      </h2>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full border border-black/5">Step 02</span>
                    </div>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="請輸入姓名，多個姓名請以換行或逗號分隔..."
                      className="w-full h-60 p-8 border-2 border-zinc-100 rounded-[2rem] focus:border-black focus:ring-[12px] focus:ring-black/5 outline-none transition-all resize-none font-bold text-xl placeholder:text-zinc-200 custom-scrollbar bg-zinc-50/30"
                    />
                    <button 
                      onClick={addFromText}
                      className="brutal-button w-full mt-8 py-6 text-xl rounded-[1.5rem] brutal-button-black"
                    >
                      <Plus size={24} className="inline-block mr-2" /> 加入至目前名單
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 brutal-border bg-black text-white p-10 rounded-[2.5rem] flex flex-col h-full min-h-[700px] relative overflow-hidden">
                  {/* Background text decoration */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black opacity-[0.03] pointer-events-none select-none italic">
                    LIST
                  </div>

                  <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-display font-black uppercase italic flex items-center gap-4">
                        目前名單
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Total Count</span>
                        <span className="bg-white text-black px-3 py-0.5 rounded-full text-xs font-black">{people.length}</span>
                      </div>
                    </div>
                    {people.length > 0 && (
                      <button 
                        onClick={clearList}
                        className="w-12 h-12 flex items-center justify-center hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-all rounded-full border border-white/10"
                        title="清除全部"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar relative z-10">
                    {people.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-800 border-2 border-zinc-900 border-dashed rounded-[2rem] py-32">
                        <motion.div 
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <AlertCircle size={64} className="mb-6 opacity-20" />
                        </motion.div>
                        <p className="font-black text-2xl uppercase italic tracking-tight">名單目前為空</p>
                        <p className="text-sm text-zinc-600 mt-2 font-medium">請從左側面板新增參與者</p>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {people.map((person, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30, scale: 0.9 }}
                            key={person.id}
                            className="flex items-center justify-between p-5 bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-[1.25rem] group hover:border-white/20 transition-all hover:bg-zinc-900/60"
                          >
                            <div className="flex items-center gap-5">
                              <span className="font-display font-black italic text-zinc-700 text-sm w-8">{(idx + 1).toString().padStart(2, '0')}</span>
                              <span className="font-black text-xl tracking-tight">{person.name}</span>
                            </div>
                            <button 
                              onClick={() => setPeople(prev => prev.filter(p => p.id !== person.id))}
                              className="opacity-0 group-hover:opacity-100 p-2.5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all rounded-xl"
                            >
                              <Trash2 size={18} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: DRAW */}
            {activeTab === 'draw' && (
              <motion.div
                key="draw"
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                <div className="lg:col-span-8 space-y-10">
                  <div className="brutal-border bg-white p-20 rounded-[3rem] flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute -top-20 -left-20 opacity-[0.02] pointer-events-none select-none">
                      <Trophy size={600} />
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {winner ? (
                        <motion.div
                          key={winner.id}
                          initial={{ scale: 0.7, opacity: 0, rotate: -5 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          className="text-center z-10"
                        >
                          <motion.div 
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-8 py-3 bg-yellow-400 text-black font-black uppercase italic text-sm tracking-[0.2em] mb-10 brutal-border rounded-xl"
                          >
                            WINNER ANNOUNCED
                          </motion.div>
                          <h3 className="text-8xl md:text-[12rem] font-display font-black italic uppercase break-all leading-[0.8] tracking-tighter mb-4">
                            {winner.name}
                          </h3>
                          <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-sm mt-8">恭喜這位幸運兒！</p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center z-10"
                        >
                          <div className="animate-float mb-10 opacity-10">
                            <Trophy size={120} className="mx-auto" />
                          </div>
                          <h3 className="text-5xl md:text-7xl font-display font-black text-zinc-200 uppercase italic tracking-tighter leading-tight">
                            {isDrawing ? '正在隨機抽取中...' : '準備好開始\n抽籤了嗎？'}
                          </h3>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-20 flex flex-col items-center gap-8 w-full max-w-lg z-10">
                      <button
                        onClick={startDraw}
                        disabled={isDrawing || (people.length === 0)}
                        className={cn(
                          "brutal-button w-full py-10 text-4xl rounded-[2rem] flex items-center justify-center gap-6 group brutal-button-black",
                          (isDrawing || people.length === 0) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isDrawing ? (
                          <RefreshCw className="animate-spin" size={40} />
                        ) : (
                          <Trophy className="group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" size={40} />
                        )}
                        <span className="font-black italic uppercase tracking-tighter">{isDrawing ? '抽籤中' : '立即抽籤'}</span>
                      </button>
                      
                      <div className="flex flex-wrap items-center justify-center gap-10 mt-4">
                        <label className="flex items-center gap-4 cursor-pointer group">
                          <div className={cn(
                            "w-8 h-8 border-2 border-black rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6",
                            allowRepeat ? "bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" : "bg-white"
                          )}>
                            {allowRepeat && <CheckCircle2 size={20} className="text-white" />}
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={allowRepeat} 
                            onChange={() => setAllowRepeat(!allowRepeat)} 
                          />
                          <span className="text-sm font-black uppercase tracking-[0.15em] text-zinc-600 group-hover:text-black transition-colors">允許重複抽取</span>
                        </label>
                        
                        <div className="flex items-center gap-3 px-6 py-3 bg-zinc-100 rounded-full text-xs font-black text-zinc-500 uppercase tracking-[0.2em] border border-black/5">
                          <Users size={16} />
                          剩餘人數: <span className="text-black text-sm">{remainingPeople.length}</span> / {people.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 brutal-border bg-white p-10 rounded-[2.5rem] flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                    <RefreshCw size={120} />
                  </div>
                  
                  <h2 className="text-3xl font-display font-black uppercase italic mb-10 flex items-center gap-4 relative z-10">
                    <span className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-black"><RefreshCw size={20} /></span>
                    抽籤紀錄
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar relative z-10">
                    {drawHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-300 py-32 border-2 border-zinc-50 border-dashed rounded-[2rem]">
                        <Trophy size={64} className="mb-6 opacity-10" />
                        <p className="font-black italic uppercase tracking-widest text-sm">尚無抽籤紀錄</p>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {drawHistory.map((person, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={`${person.id}-${idx}`}
                            className="flex items-center justify-between p-5 border-b-2 border-zinc-50 group hover:bg-zinc-50 transition-all rounded-2xl"
                          >
                            <div className="flex items-center gap-5">
                              <span className="font-display font-black text-zinc-300 text-xs italic">#{drawHistory.length - idx}</span>
                              <span className="font-black text-2xl tracking-tight">{person.name}</span>
                            </div>
                            <Trophy size={20} className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100" />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: GROUP */}
            {activeTab === 'group' && (
              <motion.div
                key="group"
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-12"
              >
                <div className="brutal-border bg-white p-12 rounded-[3rem] flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
                  
                  <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-[0.3em] text-center md:text-left">每組人數設定</label>
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                          className="w-14 h-14 brutal-border rounded-2xl flex items-center justify-center font-black hover:bg-zinc-100 transition-all text-2xl"
                        >
                          -
                        </button>
                        <div className="w-24 text-center text-6xl font-display font-black italic tracking-tighter">{groupSize}</div>
                        <button 
                          onClick={() => setGroupSize(groupSize + 1)}
                          className="w-14 h-14 brutal-border rounded-2xl flex items-center justify-center font-black hover:bg-zinc-100 transition-all text-2xl"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="hidden md:block h-20 w-[2px] bg-zinc-100" />
                    
                    <div className="text-center md:text-left space-y-2">
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">預計生成組數</p>
                      <p className="text-6xl font-display font-black italic tracking-tighter">
                        {people.length > 0 ? Math.ceil(people.length / groupSize) : 0} <span className="text-2xl not-italic font-black text-zinc-300 ml-2">組</span>
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={generateGroups}
                    disabled={people.length === 0}
                    className="brutal-button px-20 py-8 text-3xl rounded-[2rem] flex items-center gap-6 disabled:opacity-50 group brutal-button-black"
                  >
                    <LayoutGrid size={36} className="group-hover:rotate-90 transition-transform duration-700 ease-in-out" /> 
                    <span className="font-black italic uppercase tracking-tighter">開始自動分組</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                  <AnimatePresence mode="popLayout">
                    {groups.length > 0 ? (
                      groups.map((group, gIdx) => (
                        <motion.div
                          key={gIdx}
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 30 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: gIdx * 0.05 
                          }}
                          className="brutal-border bg-white overflow-hidden rounded-[2.5rem] group hover:-translate-y-3 transition-all duration-500"
                        >
                          <div className="bg-black text-white p-6 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none select-none text-6xl font-black italic -translate-x-4 translate-y-2">
                              {gIdx + 1}
                            </div>
                            <span className="font-display font-black uppercase italic tracking-tighter text-xl relative z-10">第 {gIdx + 1} 組</span>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full relative z-10 backdrop-blur-sm">{group.length} 人</span>
                          </div>
                          <div className="p-8 space-y-4 bg-gradient-to-b from-white to-[#F9F9F7]">
                            {group.map((person, pIdx) => (
                              <div key={person.id} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-transparent hover:border-black/5 transition-all group/item">
                                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center text-xs font-black font-display italic group-hover/item:bg-black group-hover/item:text-white transition-colors">
                                  {(pIdx + 1).toString().padStart(2, '0')}
                                </div>
                                <span className="font-black text-2xl tracking-tight">{person.name}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-48 text-center">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-10 opacity-20"
                        >
                          <Users size={64} />
                        </motion.div>
                        <h3 className="text-4xl md:text-5xl font-display font-black text-zinc-200 uppercase italic tracking-tighter leading-tight">設定人數並點擊按鈕<br />開始隨機分組</h3>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      
      {/* Footer Decoration */}
      <footer className="mt-48 border-t-4 border-black/5 pt-20 pb-32 flex flex-col md:flex-row justify-between items-center gap-12 text-zinc-400 max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-6 font-display font-black italic uppercase tracking-tighter text-4xl text-black">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white text-xl not-italic shadow-xl"
          >
            D
          </motion.div>
          Draw & Group <span className="text-zinc-200 ml-2">v1.0</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-16">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 text-zinc-300">System Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm font-black text-black uppercase tracking-widest">Engine Online</p>
            </div>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 text-zinc-300">Design Philosophy</p>
            <p className="text-sm font-black text-black uppercase tracking-widest">Editorial Brutalism</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 text-zinc-300">Copyright</p>
            <p className="text-sm font-black text-black uppercase tracking-widest">© 2026 Crafted Studio</p>
          </div>
        </div>
      </footer>
    </div>
  );

}
