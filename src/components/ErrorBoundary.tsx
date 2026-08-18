import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('Uncaught Error in Component:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 mx-auto max-w-xl bg-white dark:bg-[#1a0c28] rounded-2xl border-2 border-amber-400/60 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center mx-auto border border-amber-400/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold font-baloo text-slate-900 dark:text-amber-300">
              {this.props.fallbackTitle || 'Terjadi Kendala pada Tampilan Komponen'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {this.state.error?.message || 'Komponen mengalami error tidak terduga. Silakan muat ulang komponen.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs transition-colors shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Muat Ulang Komponen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
