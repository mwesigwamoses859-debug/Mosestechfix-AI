import React, { useState, useEffect, useRef } from 'react';
import { BusinessProfile, ChatMessage, DeviceCategory, Manufacturer, SafetyLevel, CaseTicket, TechSolution } from '../types';
import { INITIAL_TECH_SOLUTIONS } from '../data/initialData';
import { getAccessStatus } from '../utils/subscriptionManager';
import {
  Bot,
  Send,
  Mic,
  Sparkles,
  Upload,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Wrench,
  PhoneCall,
  Volume2,
  VolumeX,
  Laptop,
  Monitor,
  Printer,
  Wifi,
  Smartphone,
  Shield,
  Clock,
  MapPin,
  X,
  Check,
  Copy,
  ExternalLink,
  Globe,
  BookOpen,
  ChevronRight,
  Lock,
  Flame,
  CheckCircle2,
  Camera,
  Activity,
  Sliders,
  PlusCircle,
  ArrowUp,
  RotateCcw,
  Paperclip,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FixAITroubleshooterProps {
  profile: BusinessProfile;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  tickets: CaseTicket[];
  setTickets: React.Dispatch<React.SetStateAction<CaseTicket[]>>;
  incrementAiUsage: () => void;
  onOpenBookingModal?: (data?: any) => void;
  onOpenSubscriptionModal?: () => void;
}

// Utility: Detect safety level based on user input
export function analyzeSafetyLevel(text: string): SafetyLevel {
  const lower = text.toLowerCase();

  // RED Hazard Keywords (Immediate risk of physical damage, shock, or fire)
  const redKeywords = [
    'swollen', 'swelling', 'smoke', 'burnt', 'burning', 'spark', 'sparking',
    'water', 'liquid', 'spill', 'spilled', 'fire', 'hot to touch', 'smells hot',
    'explosion', 'exposed wire', 'cracked battery', 'battery bulge'
  ];
  if (redKeywords.some((kw) => lower.includes(kw))) {
    return 'Red';
  }

  // AMBER Caution Keywords (Hardware opening, disassembly, BIOS, system modification, risk of data loss)
  const amberKeywords = [
    'ram', 'bios', 'uefi', 'disassemble', 'open casing', 'unscrew', 'cmd',
    'command prompt', 'sfc', 'chkdsk', 'format', 'reinstall', 'driver',
    'soldering', 'motherboard', 'cmos', 'diskpart', 'replace screen', 'thermal paste'
  ];
  if (amberKeywords.some((kw) => lower.includes(kw))) {
    return 'Amber';
  }

  return 'Green';
}

// Utility: Search Knowledge Base for matching solutions
export function matchKnowledgeBaseSolution(userText: string, category?: DeviceCategory): TechSolution | undefined {
  const query = userText.toLowerCase();

  return INITIAL_TECH_SOLUTIONS.find((sol) => {
    const categoryMatches = !category || sol.deviceCategory.toLowerCase() === category.toLowerCase() || sol.deviceCategory.toLowerCase().includes(category.toLowerCase());
    const keywordMatches = sol.symptomKeywords.some((kw) => query.includes(kw.toLowerCase()));
    const titleMatches = sol.problemTitle.toLowerCase().split(' ').some((word) => word.length > 3 && query.includes(word));
    return (categoryMatches && keywordMatches) || keywordMatches || titleMatches;
  });
}

// Hardware category definitions with rich icons and descriptors
const HARDWARE_CATEGORIES: { id: DeviceCategory; label: string; sub: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'Windows Laptop', label: 'Laptop', sub: 'HP, Dell, Lenovo', icon: Laptop },
  { id: 'Desktop PC', label: 'Desktop PC', sub: 'Towers & All-in-Ones', icon: Monitor },
  { id: 'Printer & Scanner', label: 'Printer / Scan', sub: 'Epson, Canon, HP', icon: Printer },
  { id: 'Wi-Fi & Router', label: 'Wi-Fi / MiFi', sub: 'TP-Link, Airtel, MTN', icon: Wifi },
  { id: 'Android Phone', label: 'Phone / Tablet', sub: 'Samsung, Tecno, iOS', icon: Smartphone },
  { id: 'CCTV & Security', label: 'CCTV & Sec', sub: 'DVRs & IP Cameras', icon: Shield },
];

export const FixAITroubleshooter: React.FC<FixAITroubleshooterProps> = ({
  profile,
  messages,
  setMessages,
  tickets,
  setTickets,
  incrementAiUsage,
  onOpenBookingModal,
  onOpenSubscriptionModal,
}) => {
  const [input, setInput] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<DeviceCategory>('Windows Laptop');
  const [selectedBrand, setSelectedBrand] = useState<Manufacturer>('HP');
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [showHardwarePanel, setShowHardwarePanel] = useState(false);

  // Booking Modal State
  const [bookingTicketData, setBookingTicketData] = useState<any | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custLoc, setCustLoc] = useState('Kampala');
  const [bookingType, setBookingType] = useState<'Remote Support' | 'Onsite Technician Visit' | 'Shop Repair Drop-off'>('Remote Support');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Voice recognition init
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-UG';

        rec.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };

        rec.onend = () => setIsListening(false);
        rec.onerror = () => setIsListening(false);

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported on this browser. Please type your message.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this device.');
      return;
    }
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadedImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Hello ${profile.ownerName || 'Friend'}! I am MosesTech Fix AI, your 1-step IT diagnostic assistant for laptops, desktops, printers, and Wi-Fi networks in Uganda. How can I help you troubleshoot or diagnose your computer issue today?`,
        safetyLevel: 'Green',
        timestamp: 'Just now',
      }
    ]);
    setInput('');
    setUploadedImageBase64(null);
  };

  const handleSend = async (customPrompt?: string) => {
    const access = getAccessStatus();
    if (access.isLocked) {
      if (onOpenSubscriptionModal) {
        onOpenSubscriptionModal();
      } else {
        alert('🔒 3-Day Free Trial Expired!\n\nPlease activate 10,000 UGX/week, 20,000 UGX/month, or $5 USD Card package to continue using MosesTech Fix AI.');
      }
      return;
    }

    const promptToSend = customPrompt || input;
    if ((!promptToSend.trim() && !uploadedImageBase64) || isLoading) return;

    // Detect client-side safety level & knowledge base solution match
    const detectedSafety = analyzeSafetyLevel(promptToSend);
    const matchedKbSolution = matchKnowledgeBaseSolution(promptToSend, selectedDevice);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptToSend || (uploadedImageBase64 ? 'Uploaded screenshot/photograph for diagnosis' : ''),
      imageUrl: uploadedImageBase64 || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);
    incrementAiUsage();

    const currentImage = uploadedImageBase64;
    setUploadedImageBase64(null);

    try {
      let res;
      if (currentImage) {
        res = await fetch('/api/ai/diagnose-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImage,
            userNotes: promptToSend,
          }),
        });
      } else {
        res = await fetch('/api/ai/diagnose-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptToSend,
            deviceCategory: selectedDevice,
            manufacturer: selectedBrand,
            model: selectedModel,
            history: messages.slice(-6),
          }),
        });
      }

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      let assistantText = data.text || 'I could not process the diagnosis.';
      let structuredAction: any = null;
      let safetyLevel: SafetyLevel = detectedSafety;

      // Parse JSON block if present
      const jsonMatch = assistantText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          structuredAction = parsed;
          if (parsed.data?.safetyLevel) {
            safetyLevel = parsed.data.safetyLevel;
          }
          assistantText = assistantText.replace(/```json\s*([\s\S]*?)\s*```/g, '').trim();
        } catch (e) {
          console.error('Failed to parse response JSON block', e);
        }
      }

      // Override to RED if client keywords indicate critical hazard
      if (detectedSafety === 'Red') {
        safetyLevel = 'Red';
      }

      // If a knowledge base solution was matched, append KB structured summary if not already included
      if (matchedKbSolution && !assistantText.includes(matchedKbSolution.problemTitle)) {
        assistantText += `\n\n📚 **Matched Knowledge Base Solution:** ${matchedKbSolution.problemTitle}\n` +
          `⏱️ *Est. Fix Time:* ${matchedKbSolution.estimatedFixTime} | 💰 *Est. Service Fee:* ${matchedKbSolution.estimatedCostUGX}\n` +
          `• **Safe Recommended Steps:**\n${matchedKbSolution.safeSteps.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}\n` +
          (matchedKbSolution.amberSteps.length > 0 ? `• **Cautionary Steps (Data Backup Recommended):**\n${matchedKbSolution.amberSteps.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')}\n` : '') +
          `\n🌐 *Official Support Guide:* ${matchedKbSolution.officialSourceUrl || 'https://mosestechfixsolution.com'}`;
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: assistantText,
        safetyLevel,
        structuredAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If action is BOOK_TECHNICIAN or safetyLevel is RED, prompt booking modal
      if (structuredAction?.actionType === 'BOOK_TECHNICIAN' || safetyLevel === 'Red') {
        setBookingTicketData(structuredAction?.data || {
          symptoms: promptToSend,
          deviceCategory: selectedDevice,
          manufacturer: selectedBrand,
          model: selectedModel,
          safetyLevel,
        });
        setShowBookingModal(true);
      }
    } catch (err: any) {
      console.warn('Diagnose API Call Error, triggering local Knowledge Base fallback engine:', err);

      let fallbackText = '';
      let safetyLevel: SafetyLevel = detectedSafety;

      if (matchedKbSolution) {
        fallbackText = `🛠️ **MosesTech Knowledge Base Diagnostic Match**\n\n` +
          `**Problem Identified:** ${matchedKbSolution.problemTitle}\n` +
          `**Device:** ${selectedBrand} ${selectedModel || selectedDevice}\n\n` +
          `**Common Causes:**\n${matchedKbSolution.commonCauses.map((c) => `• ${c}`).join('\n')}\n\n` +
          `**Step 1 — Safe Troubleshooting (Green Safety):**\n${matchedKbSolution.safeSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
          (matchedKbSolution.amberSteps.length > 0 ? `**Caution Steps (Amber Safety — Backup Data First):**\n${matchedKbSolution.amberSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` : '') +
          `⏱️ *Estimated Fix Time:* ${matchedKbSolution.estimatedFixTime} | 💰 *Estimated Service Fee:* ${matchedKbSolution.estimatedCostUGX}\n` +
          `🌐 *Official Guide:* ${matchedKbSolution.officialSourceUrl || 'https://mosestechfixsolution.com'}\n` +
          `📞 *Hotline / WhatsApp:* 0708262179 / 0789218570`;
      } else if (detectedSafety === 'Red') {
        fallbackText = `⚠️ **CRITICAL SAFETY ALERT (Red Level Hazard)**\n\n` +
          `For your safety and to prevent permanent component damage, do NOT attempt to turn on or open this device.\n\n` +
          `• **Immediate Action:** Unplug power charger immediately.\n` +
          `• **Technician Escalation:** Please book an onsite technician visit or drop off your device at our Ntinda, Kampala shop.\n\n` +
          `📞 **MosesTech Direct Helpdesk:** 0708262179 (Airtel) / 0789218570 (MTN)\n` +
          `🌐 **Official Portal:** https://mosestechfixsolution.com`;
      } else {
        fallbackText = `🔧 **MosesTech Fix AI Guided Diagnostic Step 1**\n\n` +
          `Device: ${selectedBrand} ${selectedModel || selectedDevice} (${selectedDevice})\n` +
          `Reported Symptoms: "${promptToSend}"\n\n` +
          `**Recommended Action (Green Safe Level):**\n` +
          `1. Disconnect all external USB drives, power cables, and accessories.\n` +
          `2. Perform a hard power reset by holding down the power button for 20 seconds continuously.\n` +
          `3. Reconnect only the power cable directly to a wall outlet and attempt power on.\n\n` +
          `If the issue persists, click "Completed Step" or "Book Technician" below to request an engineer visit in Kampala!\n` +
          `🌐 https://mosestechfixsolution.com | 📞 0708262179 / 0789218570`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: fallbackText,
          safetyLevel,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (safetyLevel === 'Red') {
        setBookingTicketData({
          symptoms: promptToSend,
          deviceCategory: selectedDevice,
          manufacturer: selectedBrand,
          model: selectedModel,
          safetyLevel: 'Red',
        });
        setShowBookingModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create & Dispatch Ticket
  const handleConfirmBooking = (selectedWaPhone: string = '256708262179') => {
    if (!custName || !custPhone) {
      alert('Please enter customer name and phone number.');
      return;
    }

    const ticketNumber = `MTF-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: CaseTicket = {
      id: Date.now().toString(),
      ticketNumber,
      customerName: custName,
      customerPhone: custPhone,
      location: custLoc || 'Kampala',
      deviceCategory: bookingTicketData?.deviceCategory || selectedDevice,
      manufacturer: bookingTicketData?.manufacturer || selectedBrand,
      model: bookingTicketData?.model || selectedModel || 'Laptop/Device',
      symptoms: bookingTicketData?.symptoms || 'Troubleshooting Escalation',
      attemptedSteps: ['MosesTech AI Initial Diagnostic Completed'],
      safetyLevel: bookingTicketData?.safetyLevel || 'Amber',
      bookingType,
      estimatedFeeUGX: bookingType === 'Remote Support' ? 25000 : bookingType === 'Onsite Technician Visit' ? 45000 : 30000,
      status: 'Awaiting Technician',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: `Booked via MosesTech Fix AI. Contact: ${custPhone}`,
    };

    setTickets((prev) => [newTicket, ...prev]);
    setShowBookingModal(false);

    // Format WhatsApp Case Summary with hotline and website URL
    const waText = encodeURIComponent(
      `🛠️ *MOSES TECH FIX AI — REPAIR TICKET* (${ticketNumber})\n` +
      `👤 *Customer:* ${custName}\n` +
      `📞 *Customer Phone:* ${custPhone}\n` +
      `📍 *Location:* ${custLoc}\n` +
      `💻 *Device:* ${newTicket.manufacturer} ${newTicket.model} (${newTicket.deviceCategory})\n` +
      `⚠️ *Symptoms:* ${newTicket.symptoms}\n` +
      `🛡️ *Safety Level:* ${newTicket.safetyLevel}\n` +
      `🚀 *Booking Type:* ${bookingType}\n` +
      `💰 *Estimated Service Fee:* UGX ${newTicket.estimatedFeeUGX?.toLocaleString()}\n\n` +
      `🌐 *More Info & Services:* https://mosestechfixsolution.com\n` +
      `📞 *Hotline:* 0708262179 / 0789218570\n` +
      `Please assign an IT technician to assist!`
    );

    window.open(`https://wa.me/${selectedWaPhone}?text=${waText}`, '_blank');
  };

  const lastAssistantMsg = [...messages].reverse().find((m) => m.sender === 'assistant');
  const activeSafetyLevel: SafetyLevel = lastAssistantMsg?.safetyLevel || (input ? analyzeSafetyLevel(input) : 'Green');

  const CHATGPT_SUGGESTIONS = [
    { title: 'HP Laptop Amber Light Blinking', desc: 'Screen stays black, power LED blinks orange/white', category: 'Windows Laptop', brand: 'HP', prompt: 'My HP laptop is blinking orange/white light when plugged in and the screen stays black.' },
    { title: 'Blue Screen CRITICAL_PROCESS_DIED', desc: 'Windows crash loop with Stop Error code', category: 'Windows Laptop', brand: 'Dell', prompt: 'My computer crashed with a blue screen error CRITICAL_PROCESS_DIED and keeps rebooting.' },
    { title: 'Epson Printer Paper Jam / Red Light', desc: 'Spooler service offline or ink light flashing', category: 'Printer & Scanner', brand: 'Epson', prompt: 'Epson printer says Print Spooler service stopped and red error light is blinking.' },
    { title: 'Wi-Fi Connected But No Internet', desc: 'Yellow triangle exclamation mark on network', category: 'Wi-Fi & Router', brand: 'TP-Link', prompt: 'Wi-Fi shows yellow triangle: Connected, no internet access on Windows.' },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8.5rem)] min-h-[580px] text-slate-900 dark:text-slate-100">
      
      {/* ChatGPT-Style Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-t-2xl shrink-0">
        
        {/* Model Selector / Target Device Pill */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-slate-800 dark:text-slate-200 font-mono">MosesTech Fix AI 2.0</span>
          </div>

          <button
            type="button"
            onClick={() => setShowHardwarePanel(!showHardwarePanel)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Configure target device"
          >
            <span className="font-semibold truncate max-w-[120px] sm:max-w-xs">
              🎯 {selectedDevice} ({selectedBrand})
            </span>
            {showHardwarePanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Action Controls: New Chat, Safety Level & Hotline */}
        <div className="flex items-center space-x-2">
          {/* Live Safety Level Indicator */}
          <span className={`hidden sm:flex text-[10px] font-black uppercase px-2.5 py-1 rounded-full items-center gap-1 border ${
            activeSafetyLevel === 'Green'
              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600'
              : activeSafetyLevel === 'Amber'
              ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-600'
              : 'bg-red-50 dark:bg-red-950/70 text-red-800 dark:text-red-300 border-red-300 dark:border-red-600 animate-pulse'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              activeSafetyLevel === 'Green' ? 'bg-emerald-500' : activeSafetyLevel === 'Amber' ? 'bg-amber-500' : 'bg-red-500'
            }`}></span>
            {activeSafetyLevel} Safety
          </span>

          <button
            type="button"
            onClick={handleNewChat}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            title="Start new troubleshooting conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Expandable Hardware Console Drawer */}
      {showHardwarePanel && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Device Category
            </span>
            <button
              type="button"
              onClick={() => setShowHardwarePanel(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {HARDWARE_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedDevice === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedDevice(cat.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/40 shadow-sm'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <IconComp className={`w-4 h-4 mb-2 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="font-bold text-xs block leading-tight">{cat.label}</span>
                    <span className="text-[10px] text-slate-400 truncate block mt-0.5">{cat.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Manufacturer</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value as Manufacturer)}
                className="w-full bg-white dark:bg-slate-800 text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                <option value="HP">HP (Hewlett-Packard)</option>
                <option value="Dell">Dell</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Asus">Asus</option>
                <option value="Acer">Acer</option>
                <option value="Apple">Apple Mac</option>
                <option value="Samsung">Samsung</option>
                <option value="Epson">Epson</option>
                <option value="Canon">Canon</option>
                <option value="TP-Link">TP-Link</option>
                <option value="Generic / Other">Generic / Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Model (Optional)</label>
              <input
                type="text"
                placeholder="e.g. EliteBook 840 G5 / L3150"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Stream Container (ChatGPT Layout) */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6 bg-slate-50/40 dark:bg-slate-950/60 transition-colors">
        {messages.length === 0 || (messages.length === 1 && messages[0].id === 'welcome') ? (
          
          /* Empty / Initial State (ChatGPT Hero Look) */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8 space-y-6 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Wrench className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                What computer problem can I solve for you today?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Describe error codes, upload diagnostic photos, or pick a common preset below to get guided 1-step repair instructions.
              </p>
            </div>

            {/* 4 Clickable Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              {CHATGPT_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedDevice(item.category as DeviceCategory);
                    setSelectedBrand(item.brand as Manufacturer);
                    handleSend(item.prompt);
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
                >
                  <p className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:rotate-45 transition-transform" />
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Trial / Lock Badge */}
            {(() => {
              const access = getAccessStatus();
              return (
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
                  <span>✨ 3-Day Free Trial Active</span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={onOpenSubscriptionModal}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    View $5/mo & MoMo Plans
                  </button>
                </div>
              );
            })()}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-3xl mx-auto`}
            >
              <div className="flex items-center space-x-2 mb-1.5 px-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {msg.sender === 'user' ? 'You' : 'MosesTech Fix AI'}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>

                {msg.safetyLevel && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      msg.safetyLevel === 'Green'
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600'
                        : msg.safetyLevel === 'Amber'
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-600'
                        : 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-600 animate-pulse'
                    }`}
                  >
                    {msg.safetyLevel === 'Green' && <CheckCircle className="w-2.5 h-2.5" />}
                    {msg.safetyLevel === 'Amber' && <AlertTriangle className="w-2.5 h-2.5" />}
                    {msg.safetyLevel === 'Red' && <AlertTriangle className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />}
                    {msg.safetyLevel} Safety
                  </span>
                )}
              </div>

              <div
                className={`w-full rounded-2xl px-4 py-3.5 text-xs leading-relaxed space-y-2.5 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white max-w-xl rounded-tr-none font-medium ml-auto'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-tl-none'
                }`}
              >
                {/* Uploaded Image Preview */}
                {msg.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded diagnostic snippet"
                      className="max-h-56 rounded-xl border border-slate-200 dark:border-slate-700 object-cover"
                    />
                  </div>
                )}

                {/* Message Content */}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                {/* Safety Warning Alert for Amber/Red */}
                {msg.safetyLevel === 'Red' && (
                  <div className="mt-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 p-2.5 rounded-xl text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-red-700 dark:text-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-700 dark:text-red-400" />
                      <span>HAZARD ALERT — DO NOT ATTEMPT REPAIR AT HOME</span>
                    </div>
                    <p className="text-[11px] text-red-800 dark:text-red-300">
                      This problem involves potential hardware damage or power risk. Escalate immediately to an IT technician.
                    </p>
                  </div>
                )}

                {/* Assistant Message Action Toolbar */}
                {msg.sender === 'assistant' && (
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => speakText(msg.text, msg.id)}
                        className="text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center space-x-1 font-medium transition-colors"
                        title="Listen to audio read aloud"
                      >
                        {speakingMsgId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                        <span>{speakingMsgId === msg.id ? 'Stop' : 'Read Aloud'}</span>
                      </button>

                      {/* Animated Waveform Visualizer during TTS */}
                      {speakingMsgId === msg.id && (
                        <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 dark:bg-emerald-950/60 rounded-full border border-emerald-500/30">
                          <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-bounce"></span>
                          <span className="w-1 h-4 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.25s]"></span>
                          <span className="w-1 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.1s]"></span>
                          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                            Voice Active
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(msg.text);
                          setCopiedId(msg.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center space-x-1 font-medium transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setBookingTicketData({
                          symptoms: msg.text.substring(0, 150),
                          deviceCategory: selectedDevice,
                          manufacturer: selectedBrand,
                          model: selectedModel,
                          safetyLevel: msg.safetyLevel || 'Amber',
                        });
                        setShowBookingModal(true);
                      }}
                      className="bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/80 px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-colors"
                    >
                      <PhoneCall className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Book Technician</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Step Feedback Quick Buttons for Assistant */}
              {msg.sender === 'assistant' && msg.safetyLevel !== 'Red' && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-2xl px-1">
                  <button
                    type="button"
                    onClick={() => handleSend('I completed this step. What is the next step?')}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center space-x-1 shadow-2xs"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>Completed Step</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend('It worked! The problem is solved now. Thank you!')}
                    className="bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1 shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>It Worked!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend('The problem remains. What else should I try?')}
                    className="bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center space-x-1 shadow-2xs"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span>Problem Remains</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-3.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
            <span>MosesTech Fix AI is diagnosing hardware schematics & manuals...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Image Preview Bar if Attached */}
      {uploadedImageBase64 && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Image attached for photo analysis</span>
            <img src={uploadedImageBase64} alt="preview" className="w-8 h-8 rounded border border-slate-300 dark:border-slate-600 object-cover" />
          </div>
          <button
            type="button"
            onClick={() => setUploadedImageBase64(null)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ChatGPT-Style Bottom Floating Input Capsule */}
      <div className="p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl shrink-0 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative max-w-3xl mx-auto flex items-center bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 px-2 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all shadow-sm"
        >
          {/* File / Camera Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full transition-colors"
            title="Upload photo / screenshot of error"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice Dictation */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition-colors ${
              isListening
                ? 'text-red-500 animate-pulse'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Input text */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message MosesTech Fix AI (e.g., 'My laptop won't turn on')..."
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />

          {/* Circular Send Button */}
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !uploadedImageBase64)}
            className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 font-medium">
          MosesTech Fix AI guided diagnostics • Always disconnect power before touching internal hardware.
        </p>
      </div>

      {/* Technician Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Book MosesTech Technician</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Ugandan Onsite & Remote IT Repair Escalation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kagimu Ronald"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Phone Number (MTN / Airtel)</label>
                <input
                  type="text"
                  placeholder="e.g. +256 702 123456"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Location / Area in Uganda</label>
                <input
                  type="text"
                  placeholder="e.g. Ntinda, Kampala / Mukono / Entebbe"
                  value={custLoc}
                  onChange={(e) => setCustLoc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Select Service Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingType('Remote Support')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      bookingType === 'Remote Support'
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-400 text-blue-900 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-bold text-[11px]">Remote Support</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">UGX 20k - 25k</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('Onsite Technician Visit')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      bookingType === 'Onsite Technician Visit'
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-400 text-blue-900 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-bold text-[11px]">Onsite Visit</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">UGX 45,000+</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('Shop Repair Drop-off')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      bookingType === 'Shop Repair Drop-off'
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-400 text-blue-900 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-bold text-[11px]">Ntinda Shop</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Free Diagnosis</p>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Auto Case Ticket Summary:</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Device:</span> {selectedBrand} {selectedModel || selectedDevice}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Symptoms:</span> {bookingTicketData?.symptoms || 'Troubleshooting'}
                </p>
                <div className="pt-1 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 mt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">More Information:</span>
                  <a
                    href="https://mosestechfixsolution.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>mosestechfixsolution.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmBooking('256708262179')}
                  className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                  title="Send via Airtel WhatsApp 0708262179"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Airtel WhatsApp (0708262179)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmBooking('256789218570')}
                  className="w-full sm:w-auto px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                  title="Send via MTN WhatsApp 0789218570"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>MTN WhatsApp (0789218570)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
