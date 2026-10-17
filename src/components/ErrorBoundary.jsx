import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 text-center">
          <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              Terjadi Kendala Memuat Halaman
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Sistem mendeteksi kendala pada antarmuka. Silakan muat ulang halaman atau kembali ke beranda.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-neutral-400 bg-neutral-100 p-2.5 rounded-xl break-all text-left">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Muat Ulang
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 py-2.5 px-4 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Ke Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
