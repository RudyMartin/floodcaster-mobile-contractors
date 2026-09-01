// F4 — React error boundary. A component crash renders a contained fallback
// (with a retry) instead of unmounting the whole app to a white screen.
// Must be a class component (getDerivedStateFromError / componentDidCatch).
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep it observable; a real logger/Sentry hook can attach here later.
    console.error(`[ErrorBoundary${this.props.label ? ' ' + this.props.label : ''}]`, error, info);
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const label = this.props.label || 'This section';
    const msg = (this.state.error && this.state.error.message) || 'Unexpected error';
    return (
      <div
        role="alert"
        style={{
          border: '1px solid #5f3a1f',
          background: '#1e1208',
          color: '#f7b87e',
          borderRadius: 6,
          padding: '12px 14px',
          font: "13px/1.5 'DM Sans', system-ui, sans-serif",
          margin: '8px 0',
        }}
      >
        <strong style={{ display: 'block', marginBottom: 4 }}>
          {label} hit an error
        </strong>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11 }}>{msg}</span>
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={this.reset}
            style={{
              background: 'transparent',
              border: '1px solid #f78166',
              color: '#f78166',
              borderRadius: 4,
              padding: '4px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
