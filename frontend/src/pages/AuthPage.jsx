import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Code2, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const { isAuthenticated, isReady, login, signup } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isReady) {
    return <div className="grid min-h-screen place-items-center bg-[#090909] text-sm text-zinc-300">Connecting to CodeArena...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password });
      }

      navigate('/dashboard');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to continue. Check your details.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page relative min-h-screen overflow-hidden bg-[#090909] text-zinc-100">
      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="login-shell w-full max-w-[440px] rounded-lg p-7 sm:p-8">
          <div className="mb-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="logo-mark grid h-11 w-11 place-items-center rounded-md">
                  <Code2 size={23} />
                  <span className="sr-only">CodeArena</span>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    CodeArena
                  </p>
                  <p className="text-xs font-medium text-slate-500">Realtime coding system</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-1.5 text-xs font-semibold text-cyan-200 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                Online
              </div>
            </div>

            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              <Sparkles size={13} />
              Developer access
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {isSignup ? 'Join the Arena.' : 'Enter the Arena.'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {isSignup
                ? 'Create your account to practice coding, debugging, MCQs, and real-time battles.'
                : 'Sign in to continue solving, competing, and tracking your developer progress.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete={isSignup ? 'off' : 'on'}>
            {isSignup && (
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Full name</span>
                <input
                  className="login-input mt-2 w-full rounded-md px-4 py-3.5 text-white outline-none"
                  name="name"
                  autoComplete="off"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Your full name"
                  required
                />
              </label>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Email address</span>
              <input
                className="login-input mt-2 w-full rounded-md px-4 py-3.5 text-white outline-none"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) => updateField({
                  target: { name: 'email', value: event.target.value.toLowerCase() },
                })}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-300">Password</span>
              <div className="relative mt-2">
                <input
                  className="login-input w-full rounded-md px-4 py-3.5 pr-12 text-white outline-none"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={updateField}
                  placeholder={isSignup ? 'Minimum 8 characters' : 'Your password'}
                  minLength={isSignup ? 8 : 1}
                  required
                />
                <button
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-cyan-300"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && (
              <p className="rounded-md border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              className="login-cta w-full rounded-md px-4 py-3.5 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Enter Arena →'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {isSignup ? 'Already have an account?' : 'New to CodeArena?'}{' '}
            <Link className="font-semibold text-cyan-300 transition hover:text-cyan-200" to={isSignup ? '/login' : '/signup'}>
              {isSignup ? 'Log in' : 'Create account'}
            </Link>
          </p>

          <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-cyan-300" />
            JWT-secured access layer
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
