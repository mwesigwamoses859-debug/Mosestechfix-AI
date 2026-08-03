import React, { useState, useEffect, useRef } from 'react';
import { BusinessProfile, ChatMessage } from '../types';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Globe,
  MessageSquare,
  AlertCircle,
  PlusCircle,
  Volume2,
  VolumeX,
  DollarSign,
  Package,
  Plus,
  Search,
  MapPin,
  Brain,
} from 'lucide-react';

interface AIAssistantProps {
  profile: BusinessProfile;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onExecuteAction: (actionType: string, data: any) => void;
  incrementAiUsage: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  profile,
  messages,
  setMessages,
  onExecuteAction,
  incrementAiUsage,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // AI Feature Mode Toggles
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [enableThinking, setEnableThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Read aloud function using Web Speech Synthesis
  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
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
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-UG'; // Ugandan English / English

        rec.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };

        rec.onerror = (event: any) => {
          console.log('Speech error:', event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in this browser. Please type your message.');
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);
    incrementAiUsage();

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          businessContext: profile,
          history: messages.slice(-6),
          useSearch,
          useMaps,
          enableThinking,
        }),
      });

      const data = await res.json();

      let assistantText = data.text || 'I could not generate a response.';
      let structuredAction: any = null;

      // Extract JSON trigger code block if present
      const jsonMatch = assistantText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          structuredAction = JSON.parse(jsonMatch[1]);
          // Clean the code block from visible message
          assistantText = assistantText.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
        } catch (e) {
          console.log('JSON parse error:', e);
        }
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredAction,
        grounding: data.grounding,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Sorry, I experienced a network issue. Please check your internet connection or API settings and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-white">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm sm:text-base text-white">
                MosesTech AI Multi-Turn Assistant
              </h2>
              <span className="bg-emerald-900/80 text-emerald-300 border border-emerald-700/80 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Uganda Context
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive chatbot with Search Grounding, Maps Grounding & High Thinking mode.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <a
            href="https://mosestechfixsolution.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-md transition-colors"
            title="Visit MosesTech Fix Solution Official Website"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">mosestechfixsolution.com</span>
            <ExternalLink className="w-3 h-3 text-emerald-400" />
          </a>

          <button
            onClick={() => {
              setMessages([
                {
                  id: 'welcome-1',
                  sender: 'assistant',
                  text: `Hello ${profile.ownerName}! I am MosesTech AI, your smart Ugandan business & diagnostic assistant. How can I help you run ${profile.name} today? Toggle Google Search, Maps, or High Thinking mode below for live web insights!`,
                  timestamp: 'Just now',
                },
              ]);
            }}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* AI Mode Selector Bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs text-slate-300">
        <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider shrink-0">AI Capabilities:</span>

        <button
          onClick={() => {
            setUseSearch(!useSearch);
            if (!useSearch) setUseMaps(false); // Maps & Search shouldn't be combined
          }}
          className={`px-3 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-all shrink-0 ${
            useSearch
              ? 'bg-blue-900/80 text-blue-300 border-blue-500 shadow-md shadow-blue-950'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Enable Google Search Grounding for live tech news, driver releases, & market pricing"
        >
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span>Google Search Data</span>
          {useSearch && <Check className="w-3 h-3 text-blue-400 ml-1" />}
        </button>

        <button
          onClick={() => {
            setUseMaps(!useMaps);
            if (!useMaps) setUseSearch(false); // Maps & Search shouldn't be combined
          }}
          className={`px-3 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-all shrink-0 ${
            useMaps
              ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Enable Google Maps Grounding for local Kampala tech shops, Ntinda directions, and locations"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Maps Data</span>
          {useMaps && <Check className="w-3 h-3 text-emerald-400 ml-1" />}
        </button>

        <button
          onClick={() => setEnableThinking(!enableThinking)}
          className={`px-3 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-all shrink-0 ${
            enableThinking
              ? 'bg-purple-900/80 text-purple-300 border-purple-500 shadow-md shadow-purple-950'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Enable Thinking Mode (gemini-3.1-pro-preview HIGH) for complex diagnostic reasoning & motherboard repair logic"
        >
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span>High Thinking Mode</span>
          {enableThinking && <Check className="w-3 h-3 text-purple-400 ml-1" />}
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1 opacity-80 text-[10px] font-medium">
                <span className="flex items-center gap-1.5">
                  <span>{m.sender === 'user' ? 'You' : 'MosesTech AI'}</span>
                  {m.sender === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => speakText(m.text, m.id)}
                      className={`p-1 rounded-md hover:bg-slate-700 transition-colors ${
                        speakingMsgId === m.id ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
                      }`}
                      title={speakingMsgId === m.id ? 'Stop Voice' : 'Listen Read Aloud'}
                    >
                      {speakingMsgId === m.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </span>
                <span>{m.timestamp}</span>
              </div>

              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Grounding Web / Map Sources */}
              {m.grounding && (m.grounding.webSources?.length || m.grounding.mapSources?.length) ? (
                <div className="mt-3 pt-2 border-t border-slate-700/80 space-y-1 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>Grounding Sources & References:</span>
                  </div>
                  {m.grounding.webSources?.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-blue-400 hover:underline text-[11px] truncate flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>{src.title}</span>
                    </a>
                  ))}
                  {m.grounding.mapSources?.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-emerald-400 hover:underline text-[11px] truncate flex items-center space-x-1"
                    >
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{src.title}</span>
                    </a>
                  ))}
                </div>
              ) : null}

              {/* Action Cards */}
              {m.structuredAction && (
                <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-2">
                  {m.structuredAction.actionType === 'CREATE_QUOTATION' && (
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40">
                      <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
                        <FileText className="w-4 h-4" />
                        <span>Ready to Draft Quotation</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">
                        I can generate an official PDF quotation for your customer in UGX.
                      </p>
                      <button
                        onClick={() =>
                          onExecuteAction('CREATE_QUOTATION', m.structuredAction?.data)
                        }
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Open & Generate Quotation PDF</span>
                      </button>
                    </div>
                  )}

                  {m.structuredAction.actionType === 'CREATE_INVOICE' && (
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40">
                      <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
                        <FileText className="w-4 h-4" />
                        <span>Ready to Draft Invoice</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">
                        Generate official payment invoice with mobile money payment terms.
                      </p>
                      <button
                        onClick={() => onExecuteAction('CREATE_INVOICE', m.structuredAction?.data)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Open & Generate Invoice</span>
                      </button>
                    </div>
                  )}

                  {m.structuredAction.actionType === 'RECORD_SALE' && (
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-blue-500/40">
                      <div className="flex items-center space-x-2 text-blue-400 font-semibold mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Parsed Sale Entry</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">
                        {m.structuredAction.data?.customerName || 'Customer'} • {m.structuredAction.data?.totalAmountUGX ? `UGX ${m.structuredAction.data.totalAmountUGX.toLocaleString()}` : ''}
                      </p>
                      <button
                        onClick={() => onExecuteAction('RECORD_SALE', m.structuredAction?.data)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Confirm & Save Sale Directly</span>
                      </button>
                    </div>
                  )}

                  {m.structuredAction.actionType === 'RECORD_EXPENSE' && (
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-rose-500/40">
                      <div className="flex items-center space-x-2 text-rose-400 font-semibold mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Parsed Expense Entry</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">
                        {m.structuredAction.data?.description} • {m.structuredAction.data?.amountUGX ? `UGX ${m.structuredAction.data.amountUGX.toLocaleString()}` : ''}
                      </p>
                      <button
                        onClick={() => onExecuteAction('RECORD_EXPENSE', m.structuredAction?.data)}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Confirm & Save Expense</span>
                      </button>
                    </div>
                  )}

                  {m.structuredAction.actionType === 'ADD_PRODUCT' && (
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-purple-500/40">
                      <div className="flex items-center space-x-2 text-purple-400 font-semibold mb-1">
                        <Package className="w-4 h-4" />
                        <span>New Product Catalog Entry</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">
                        {m.structuredAction.data?.name} • UGX {m.structuredAction.data?.unitPriceUGX?.toLocaleString()}
                      </p>
                      <button
                        onClick={() => onExecuteAction('ADD_PRODUCT', m.structuredAction?.data)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Item to Inventory</span>
                      </button>
                    </div>
                  )}

                  {m.structuredAction.actionType === 'DEBT_REMINDER' && (
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-500/40">
                      <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp Payment Reminder</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(m.text, m.id)}
                          className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied Message</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Message</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-300 p-4 rounded-2xl rounded-bl-none border border-slate-700 text-xs flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>
                {enableThinking
                  ? 'Gemini 3.1 Pro (High Thinking) is analyzing complex reasoning steps...'
                  : useSearch
                  ? 'Gemini Search Grounding is retrieving live web data...'
                  : useMaps
                  ? 'Gemini Maps Grounding is fetching geographical locations...'
                  : 'MosesTech AI is thinking and preparing your response...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions Bar */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-300">
        <span className="text-slate-500 shrink-0">Quick Prompt:</span>
        <button
          onClick={() => {
            setUseSearch(true);
            handleSend('Search latest HP EliteBook G10 laptop prices in Kampala computer markets in UGX.');
          }}
          className="shrink-0 bg-slate-800 hover:bg-blue-900/60 hover:text-blue-300 border border-slate-700 rounded-full px-3 py-1 transition-colors flex items-center space-x-1"
        >
          <Search className="w-3 h-3 text-blue-400" />
          <span>🔍 HP Laptop Prices (Search Grounded)</span>
        </button>
        <button
          onClick={() => {
            setUseMaps(true);
            handleSend('Find computer repair and spare parts shops near Ntinda, Kampala on Google Maps.');
          }}
          className="shrink-0 bg-slate-800 hover:bg-emerald-900/60 hover:text-emerald-300 border border-slate-700 rounded-full px-3 py-1 transition-colors flex items-center space-x-1"
        >
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>📍 Computer Shops Ntinda (Maps Grounded)</span>
        </button>
        <button
          onClick={() => {
            setEnableThinking(true);
            handleSend('Analyze step-by-step motherboard power rail short circuit diagnosis for a laptop not powering on.');
          }}
          className="shrink-0 bg-slate-800 hover:bg-purple-900/60 hover:text-purple-300 border border-slate-700 rounded-full px-3 py-1 transition-colors flex items-center space-x-1"
        >
          <Brain className="w-3 h-3 text-purple-400" />
          <span>🧠 Motherboard Short Diagnosis (High Thinking)</span>
        </button>
      </div>

      {/* Input Controls */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input (Speech to Text)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening... Speak now...'
                : 'Talk or type to your assistant in plain English...'
            }
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-emerald-900/30 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

