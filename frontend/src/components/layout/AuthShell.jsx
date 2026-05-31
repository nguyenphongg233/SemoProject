// Two-column shell for auth pages with brand story and form surface.
export default function AuthShell({ eyebrow, title, description, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__panel">
        <div className="auth-shell__brand">
          <span className="auth-shell__logo">S</span>
          <div>
            <p className="auth-shell__eyebrow">{eyebrow}</p>
            <h1 className="auth-shell__brand-title">SemoProject</h1>
          </div>
        </div>

        <div className="auth-shell__content">
          <p className="auth-shell__kicker">Smart scooter operations</p>
          <h2 className="auth-shell__title">{title}</h2>
          <p className="auth-shell__description">{description}</p>

          <ul className="auth-shell__list">
            <li>Secure JWT sign-in and role-based access</li>
            <li>Clean rental, scooter, and maintenance workflows</li>
            <li>Fast admin overview for daily operations</li>
          </ul>
        </div>
      </aside>

      <main className="auth-shell__main">
        <div className="auth-shell__form-wrap">{children}</div>
      </main>
    </div>
  )
}