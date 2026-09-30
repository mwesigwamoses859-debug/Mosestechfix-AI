import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MosesTech Fix AI Uncaught Error:', error, errorInfo);
  }

  private handleHardReload = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) caches.delete(name);
      });
    }
    localStorage.removeItem('m_fix_theme');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-500/10">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">MosesTech Fix AI Recovery</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We encountered a temporary rendering glitch. Click below to reload the app with a clean cache.
            </p>
            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-left text-xs font-mono text-slate-400 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleHardReload}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Reload & Clear Cache
              </button>
              <a
                href="https://wa.me/256789218570?text=Hello%20Moses,%20MosesTechFix%20AI%20app%20screen%20needs%20assistance"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl flex items-center justify-center gap-2 text-xs transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                WhatsApp Technician (0789218570)
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
