import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '36px 28px',
            margin: '32px auto',
            maxWidth: '540px',
            backgroundColor: 'var(--im-bg-surface, #ffffff)',
            border: '1px solid var(--im-border, #e2e8f0)',
            borderRadius: '16px',
            boxShadow: 'var(--im-shadow-md, 0 10px 25px -5px rgba(0, 0, 0, 0.08))',
            textAlign: 'center',
            color: 'var(--im-text-primary, #0f172a)',
            fontFamily: 'inherit',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '26px',
            }}
          >
            ⚠️
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 8px 0' }}>
            {this.props.fallbackTitle || 'Unable to display this view'}
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--im-text-muted, #64748b)',
              margin: '0 0 24px 0',
              lineHeight: 1.5,
            }}
          >
            {this.state.error?.message || 'A temporary issue occurred while rendering this component.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleReset}
              className="im-btn im-btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.875rem', borderRadius: '8px' }}
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/dashboard';
              }}
              className="im-btn im-btn-secondary"
              style={{ padding: '8px 20px', fontSize: '0.875rem', borderRadius: '8px' }}
            >
              Go to Dashboard
            </button>
          </div>
          {import.meta.env.DEV && this.state.error?.stack && (
            <details style={{ marginTop: '24px', textAlign: 'left', fontSize: '0.75rem', color: '#94a3b8' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px', color: 'var(--im-text-muted, #64748b)' }}>
                Technical Details
              </summary>
              <pre
                style={{
                  background: '#0f172a',
                  color: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  overflowX: 'auto',
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                }}
              >
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
