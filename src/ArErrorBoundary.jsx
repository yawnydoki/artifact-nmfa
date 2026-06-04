import React from 'react';

class ArErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AR Engine crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[100dvh] w-screen bg-[#16120c] flex flex-col items-center justify-center p-6 text-center z-50 relative">
          <div className="w-full max-w-sm bg-[#381111] p-2 rounded-2xl shadow-2xl">
            <div className="bg-[#E0CCB6] rounded-xl py-10 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
              
              <div className="w-16 h-16 rounded-full bg-[#4A260F]/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#4A260F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h2 className="font-serif text-[#4A260F] text-2xl font-bold mb-2">
                AR System Error
              </h2>
              <p className="font-serif text-[#4A260F]/80 text-sm leading-relaxed mb-8 max-w-xs">
                The augmented reality engine encountered an unexpected error. This typically happens due to device memory limits or an unsupported browser engine.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full border-2 border-[#4A260F] bg-transparent text-[#4A260F] hover:bg-[#4A260F] hover:text-[#E0CCB6] transition-colors py-3 rounded-lg font-serif font-bold text-lg"
              >
                Reload ArtiFact
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ArErrorBoundary;