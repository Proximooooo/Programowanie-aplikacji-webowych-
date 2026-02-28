import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ensureAuthSeed } from "../api/authApi";
import { useAuth } from "../auth/useAuth";
import "./LoginPage.css";

export default function LoginPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  ensureAuthSeed();

  return (
    <div className="login-page">
      <div className="login-container animate-fadeIn">
        <div className="login-header">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h1>ManageMe</h1>
          <p>Zaloguj się do swojego konta</p>
        </div>

        {err && <div className="error-message">{err}</div>}

        <form className="login-form" onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          auth.login(login, password)
            .then(() => nav("/"))
            .catch((e) => setErr(e instanceof Error ? e.message : "Błąd logowania"));
        }}>
          <div className="form-group">
            <label htmlFor="login">Login</label>
            <input
              id="login"
              type="text"
              placeholder="Wprowadź login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              id="password"
              type="password"
              placeholder="Wprowadź hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary login-btn">
            Zaloguj się
          </button>
        </form>

        <div className="login-demo">
          <h4>Konta demo</h4>
          <div className="demo-accounts">
            <div className="demo-account">
              <span className="badge badge-primary">ADMIN</span>
              <code>admin / Admin123!</code>
            </div>
            <div className="demo-account">
              <span className="badge badge-success">WORKER</span>
              <code>pracownik / Pracownik123!</code>
            </div>
            <div className="demo-account">
              <span className="badge badge-success">WORKER</span>
              <code>janek / Janek123!</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

