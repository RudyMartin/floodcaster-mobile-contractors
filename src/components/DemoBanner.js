// Demo Mode banner — shown on Governance/Tools (and any preview panel) when the
// visitor has no API key. Communicates that panels show sample data and that
// live execution requires a key, without ever calling it "mock".
export default function DemoBanner({ children }) {
  return (
    <div className="demo-banner">
      <span className="demo-badge">Demo Mode</span>
      <span className="demo-banner-text">
        {children || (
          <>
            You're viewing sample data. Add an API key in{' '}
            <strong>Settings</strong> to run this live.
          </>
        )}
      </span>
    </div>
  );
}
