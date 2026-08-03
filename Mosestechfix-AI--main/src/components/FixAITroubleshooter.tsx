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

  const handleSend = async (customPrompt?: string) => {
    const access = getAccessStatus();
    if (access.isLocked) {
      if (onOpenSubscriptionModal) {
        onOpenSubscriptionModal();
      } else {
        alert('🔒 3-Day Free Trial Expired!\n\nPlease activate 10,000 UGX/week or 20,000 UGX/month package to continue using MosesTech Fix AI.');
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

      // Local fallback diagnostic synthesis using Knowledge Base
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

  const QUICK_SYMPTOMS = [
    { label: 'HP Laptop Amber Light Blinking', category: 'Windows Laptop', brand: 'HP', prompt: 'My HP laptop is blinking orange/white light when plugged in and the screen stays black.' },
    { label: 'Blue Screen CRITICAL_PROCESS_DIED', category: 'Windows Laptop', brand: 'Dell', prompt: 'My computer crashed with a blue screen error CRITICAL_PROCESS_DIED and keeps rebooting.' },
    { label: 'No Display but Fan Spinning', category: 'Desktop PC', brand: 'Dell', prompt: 'Desktop tower turns on and fan spins loud, but nothing shows on the monitor.' },
    { label: 'Printer Spooler Error / Offline', category: 'Printer & Scanner', brand: 'Epson', prompt: 'Epson printer says Print Spooler service stopped and prints nothing.' },
    { label: 'Wi-Fi Connected No Internet', category: 'Wi-Fi & Router', brand: 'TP-Link', prompt: 'Wi-Fi shows yellow triangle exclamation mark: Connected but no internet access.' },
    { label: 'Swollen Battery / Extremely Hot', category: 'Windows Laptop', brand: 'Lenovo', prompt: 'My laptop battery casing is swollen pushing up the touchpad and smells hot.' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Top Banner & Device Category Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">MosesTech Fix AI Engine</h1>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Guided Diagnostic
                </span>
              </div>
              <p className="text-xs text-slate-500">
                1-Step Diagnostic Assistant for Windows Laptops, Desktops, Printers, Wi-Fi & Phones in Uganda
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <a
              href="https://mosestechfixsolution.com"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-white" />
              <span>mosestechfixsolution.com</span>
              <ExternalLink className="w-3 h-3 text-white opacity-80" />
            </a>
            <a
              href="https://wa.me/256708262179"
              target="_blank"
              rel="noreferrer"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 font-semibold transition-colors"
              title="Chat Airtel WhatsApp 0708262179"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>0708262179</span>
            </a>
            <a
              href="https://wa.me/256789218570"
              target="_blank"
              rel="noreferrer"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 font-semibold transition-colors"
              title="Chat MTN WhatsApp 0789218570"
            >
              <PhoneCall className="w-3.5 h-3.5 text-yellow-600" />
              <span>0789218570</span>
            </a>
          </div>
        </div>

        {/* 3-Day Free Trial & System Lock Status Banner */}
        {(() => {
          const access = getAccessStatus();
          return (
            <div className={`mb-4 p-3.5 text-white rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
              access.isLocked
                ? 'bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 border-red-500'
                : 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-emerald-500/50'
            }`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{access.isLocked ? '🔒' : '🎁'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      access.isLocked ? 'bg-red-500 text-white' : 'bg-emerald-400 text-slate-950'
                    }`}>
                      {access.isLocked ? 'System Locked' : '3-Day Free Trial'}
                    </span>
                    <span className="text-xs text-slate-200 font-bold">
                      {access.isPaid
                        ? `Paid Plan Active (${access.daysRemaining} days remaining)`
                        : access.isLocked
                        ? '3-Day Free Trial Expired'
                        : `3 Days Free Access (${access.daysRemaining}d ${access.hoursRemaining}h left)`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium mt-0.5">
                    {access.isLocked
                      ? 'Your 3-day free trial has expired. Subscribe to 10,000 UGX/week or 20,000 UGX/month to unlock AI diagnostics.'
                      : 'Every device gets 3 days of free unlimited AI troubleshooting! Continue with 10,000 UGX/week or 20,000 UGX/month.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenSubscriptionModal}
                className={`w-full sm:w-auto px-4 py-2 font-extrabold text-xs rounded-lg shadow transition-all hover:scale-105 shrink-0 flex items-center justify-center gap-1.5 ${
                  access.isLocked
                    ? 'bg-red-500 hover:bg-red-400 text-white'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                }`}
              >
                <span>{access.isLocked ? 'Pay / Enter Code to Unlock' : 'View Access Plans'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })()}

        {/* Device Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
              1. Device Category
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value as DeviceCategory)}
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Windows Laptop">💻 Windows Laptop</option>
              <option value="Desktop PC">🖥️ Desktop PC</option>
              <option value="Printer & Scanner">🖨️ Printer & Scanner</option>
              <option value="Wi-Fi & Router">📶 Wi-Fi & Router / MiFi</option>
              <option value="Android Phone">📱 Android Phone</option>
              <option value="CCTV & Security">📹 CCTV & Security System</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
              2. Manufacturer / Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value as Manufacturer)}
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="HP">HP (Hewlett-Packard)</option>
              <option value="Dell">Dell (Latitude / OptiPlex)</option>
              <option value="Lenovo">Lenovo (ThinkPad / IdeaPad)</option>
              <option value="Asus">Asus</option>
              <option value="Acer">Acer</option>
              <option value="Apple">Apple Mac / iPad</option>
              <option value="Samsung">Samsung</option>
              <option value="Epson">Epson (EcoTank / InkJet)</option>
              <option value="Canon">Canon</option>
              <option value="TP-Link">TP-Link Router / MiFi</option>
              <option value="Generic / Other">Generic / Other Brand</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
              3. Device Model (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. EliteBook 840 G3 / L3150"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Quick Symptoms Chips */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-600 mb-2">Common Problem Presets (Click to diagnose):</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SYMPTOMS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDevice(item.category as DeviceCategory);
                  setSelectedBrand(item.brand as Manufacturer);
                  handleSend(item.prompt);
                }}
                className="bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors text-left flex items-center space-x-1.5 shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[560px]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                <Bot className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Welcome to MosesTech Fix AI</h3>
              <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                Describe your tech issue in plain English or Luganda, upload a screenshot or photo of an error code, and get guided 1-step safe troubleshooting or technician booking.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {msg.sender === 'user' ? 'You' : 'MosesTech Fix AI'}
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>

                  {msg.safetyLevel && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        msg.safetyLevel === 'Green'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : msg.safetyLevel === 'Amber'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                      }`}
                    >
                      {msg.safetyLevel === 'Green' && <CheckCircle className="w-2.5 h-2.5" />}
                      {msg.safetyLevel === 'Amber' && <AlertTriangle className="w-2.5 h-2.5" />}
                      {msg.safetyLevel === 'Red' && <AlertTriangle className="w-2.5 h-2.5 text-red-600" />}
                      {msg.safetyLevel} Safety
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Uploaded Image Preview */}
                  {msg.imageUrl && (
                    <div className="mb-2">
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded diagnostic snippet"
                        className="max-h-48 rounded-xl border border-slate-200 object-cover"
                      />
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Safety Warning Box for Amber/Red */}
                  {msg.safetyLevel === 'Red' && (
                    <div className="mt-2 bg-red-50 border border-red-200 text-red-900 p-2.5 rounded-xl text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-red-700">
                        <AlertTriangle className="w-4 h-4 text-red-700" />
                        <span>HAZARD ALERT — DO NOT ATTEMPT REPAIR AT HOME</span>
                      </div>
                      <p className="text-[11px] text-red-800">
                        This problem involves potential hardware damage or power risk. Escalate immediately to an IT technician.
                      </p>
                    </div>
                  )}

                  {/* Action Bar for Assistant Message */}
                  {msg.sender === 'assistant' && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className="text-slate-500 hover:text-emerald-700 flex items-center space-x-1 font-medium"
                          title="Listen to audio read aloud"
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span>Read Aloud</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.text);
                            setCopiedId(msg.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="text-slate-500 hover:text-emerald-700 flex items-center space-x-1 font-medium"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <button
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
                        className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-colors"
                      >
                        <PhoneCall className="w-3 h-3 text-blue-600" />
                        <span>Book Technician</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Step Feedback Quick Buttons for Assistant */}
                {msg.sender === 'assistant' && msg.safetyLevel !== 'Red' && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-2xl">
                    <button
                      onClick={() => handleSend('I completed this step. What is the next step?')}
                      className="bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 flex items-center space-x-1 shadow-2xs"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Completed Step</span>
                    </button>
                    <button
                      onClick={() => handleSend('It worked! The problem is solved now. Thank you!')}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>It Worked!</span>
                    </button>
                    <button
                      onClick={() => handleSend('The problem remains. What else should I try?')}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-200 flex items-center space-x-1 shadow-2xs"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Problem Remains</span>
                    </button>
                    <button
                      onClick={() => handleSend('I cannot find this setting or cable on my device.')}
                      className="bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 flex items-center space-x-1 shadow-2xs"
                    >
                      <HelpCircle className="w-3 h-3 text-slate-500" />
                      <span>Cannot Find Setting</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-700 bg-white p-3 rounded-2xl w-fit border border-slate-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>MosesTech Fix AI is analyzing diagnostic logs & manufacturer manuals...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Uploaded Image Preview Bar before Send */}
        {uploadedImageBase64 && (
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Image attached for photo analysis</span>
              <img src={uploadedImageBase64} alt="preview" className="w-8 h-8 rounded border border-slate-300 object-cover" />
            </div>
            <button
              onClick={() => setUploadedImageBase64(null)}
              className="text-slate-500 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            {/* Image upload button */}
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
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="Upload error screenshot or photo"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-colors ${
                isListening
                  ? 'bg-red-100 text-red-600 border-red-300 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Voice dictation"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what is wrong or upload a photo (e.g., 'My HP laptop is blinking orange')..."
              className="flex-1 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 font-medium"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !uploadedImageBase64)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Diagnose</span>
            </button>
          </form>
        </div>
      </div>

      {/* Technician Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Book MosesTech Technician</h3>
                  <p className="text-[11px] text-slate-500">Ugandan Onsite & Remote IT Repair Escalation</p>
                </div>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kagimu Ronald"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Phone Number (MTN / Airtel)</label>
                <input
                  type="text"
                  placeholder="e.g. +256 702 123456"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Location / Area in Uganda</label>
                <input
                  type="text"
                  placeholder="e.g. Ntinda, Kampala / Mukono / Entebbe"
                  value={custLoc}
                  onChange={(e) => setCustLoc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Select Service Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingType('Remote Support')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      bookingType === 'Remote Support'
                        ? 'bg-blue-50 border-blue-400 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <p className="font-bold text-[11px]">Remote Support</p>
                    <p className="text-[10px] text-slate-500">UGX 20k - 25k</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('Onsite Technician Visit')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      bookingType === 'Onsite Technician Visit'
                        ? 'bg-blue-50 border-blue-400 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <p className="font-bold text-[11px]">Onsite Visit</p>
                    <p className="text-[10px] text-slate-500">UGX 45,000+</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('Shop Repair Drop-off')}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      bookingType === 'Shop Repair Drop-off'
                        ? 'bg-blue-50 border-blue-400 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <p className="font-bold text-[11px]">Ntinda Shop Drop-off</p>
                    <p className="text-[10px] text-slate-500">Free Diagnosis</p>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-800">Auto Case Ticket Summary:</p>
                <p className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-900">Device:</span> {selectedBrand} {selectedModel || selectedDevice}
                </p>
                <p className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-900">Symptoms:</span> {bookingTicketData?.symptoms || 'Troubleshooting'}
                </p>
                <div className="pt-1 flex items-center justify-between border-t border-slate-200 mt-1">
                  <span className="text-[11px] text-slate-500">More Information:</span>
                  <a
                    href="https://mosestechfixsolution.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>mosestechfixsolution.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
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
                  <span>Send WhatsApp (0708262179)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmBooking('256789218570')}
                  className="w-full sm:w-auto px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                  title="Send via MTN WhatsApp 0789218570"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Send WhatsApp (0789218570)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
