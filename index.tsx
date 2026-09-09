import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

class ErrorBoundary extends React.Component<any, any> {
  state: any = { error: null };
  props: any;

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', color: '#111' }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Si è verificato un errore</h2>
          <pre style={{ background: '#fef2f2', color: '#b91c1c', padding: 16, borderRadius: 12, whiteSpace: 'pre-wrap' }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 12, padding: '12px 24px', borderRadius: 12, border: 0, background: '#0f766e', color: '#fff', fontWeight: 700, fontSize: 16 }}
          >
            Riavvia
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

window.addEventListener('error', (e) => {
  const el = document.getElementById('fatal-error');
  if (el) {
    el.textContent = String(e.message || e.error);
    el.style.display = 'block';
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);