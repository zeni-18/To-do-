import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-header">
          <Layout size={40} className="auth-logo" />
          <h1>Welcome back</h1>
          <p>Elevate your productivity today.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit">
            <span>Sign In</span>
            <ArrowRight size={18} />
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .auth-page {
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, hsla(var(--primary), 0.1), transparent 40%),
                      radial-gradient(circle at bottom left, hsla(var(--primary), 0.05), transparent 40%);
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
          border-radius: var(--radius);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-logo {
          color: hsl(var(--primary));
          margin-bottom: 1rem;
        }
        .auth-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .auth-header p {
          color: hsl(var(--muted-foreground));
          font-size: 0.95rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          color: hsl(var(--muted-foreground));
        }
        .input-group input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          background: hsl(var(--background));
          transition: border-color 0.2s;
        }
        .input-group input:focus {
          outline: none;
          border-color: hsl(var(--primary));
        }
        .auth-submit {
          padding: 0.85rem;
          gap: 0.5rem;
          font-size: 1rem;
        }
        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: hsl(var(--muted-foreground));
        }
        .auth-footer a {
          color: hsl(var(--primary));
          font-weight: 600;
        }
      `}} />
    </div>
  );
};

export default Login;
