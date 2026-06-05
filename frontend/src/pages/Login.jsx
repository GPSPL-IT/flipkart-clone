import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Key, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot password flow states
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSentMsg, setResetSentMsg] = useState('');
  const [simulatedResetUrl, setSimulatedResetUrl] = useState('');

  // Extract redirect query parameter if exists
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect') ? `/${params.get('redirect')}` : '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) {
      return setAuthError('Please fill out all credentials fields.');
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setResetSentMsg('');
    setSimulatedResetUrl('');

    if (!email) {
      return setAuthError('Please enter your email address.');
    }

    setSubmitting(true);
    try {
      const data = await forgotPassword(email);
      setResetSentMsg(data.message);
      if (data.resetUrl) {
        setSimulatedResetUrl(data.resetUrl);
      }
    } catch (err) {
      setAuthError(err.message || 'Failed to request reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm shadow-sm transition-colors overflow-hidden flex flex-col md:flex-row">
        
        {/* Left branding banner block for Flipkart feel */}
        <div className="bg-flipkart-blue text-white p-6 md:w-2/5 flex flex-col justify-between hidden md:flex">
          <div>
            <h3 className="text-xl font-bold">{forgotMode ? 'Reset' : 'Login'}</h3>
            <p className="text-xs text-blue-100 mt-2 leading-relaxed">
              {forgotMode
                ? 'Get access to your Orders, Wishlist and Recommendations'
                : 'Get access to your Orders, Wishlist and Recommendations'}
            </p>
          </div>
          <span className="text-xl font-black italic tracking-wide text-white/20 select-none">
            Flipkart
          </span>
        </div>

        {/* Right forms fields panel */}
        <div className="p-6 flex-1 flex flex-col gap-4">
          <div className="md:hidden">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {forgotMode ? 'Reset Password' : 'Login to Flipkart'}
            </h3>
          </div>

          {authError && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-2.5 rounded text-xs font-semibold flex items-center gap-1.5 border border-red-100 dark:border-red-900">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {resetSentMsg && (
            <div className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 p-2.5 rounded text-xs font-semibold border border-green-100 dark:border-green-900">
              {resetSentMsg}
            </div>
          )}

          {simulatedResetUrl && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-3 rounded text-center">
              <p className="text-[10px] text-yellow-800 dark:text-yellow-400 font-bold mb-2">Simulated Developer Reset Button:</p>
              <a
                href={simulatedResetUrl}
                className="inline-block bg-flipkart-yellow hover:bg-flipkart-yellow-dark text-gray-950 font-bold text-[10px] px-3.5 py-1.5 rounded shadow-sm"
              >
                TEST PASSWORD RESET
              </a>
            </div>
          )}

          {!forgotMode ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Email Address</label>
                <div className="flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 rounded-sm overflow-hidden px-2.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent px-2.5 py-2 text-sm outline-none border-none text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Password</label>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setAuthError(''); }}
                    className="text-[10px] text-flipkart-blue font-bold hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 rounded-sm overflow-hidden px-2.5">
                  <Key className="w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent px-2.5 py-2 text-sm outline-none border-none text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-flipkart-orange hover:bg-flipkart-orange-dark text-white font-bold py-2.5 rounded-sm text-xs shadow-sm disabled:opacity-50 transition-colors mt-2"
              >
                {submitting ? 'LOGGING IN...' : 'LOGIN'}
              </button>
            </form>
          ) : (
            /* FORGOT PASSWORD FORM */
            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Email Address</label>
                <div className="flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 rounded-sm overflow-hidden px-2.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent px-2.5 py-2 text-sm outline-none border-none text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold py-2.5 rounded-sm text-xs shadow-sm disabled:opacity-50 transition-colors"
              >
                {submitting ? 'REQUESTING LINK...' : 'SEND RESET LINK'}
              </button>

              <button
                type="button"
                onClick={() => { setForgotMode(false); setAuthError(''); setResetSentMsg(''); setSimulatedResetUrl(''); }}
                className="text-xs font-bold text-gray-500 hover:underline text-center"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Bottom redirection */}
          {!forgotMode && (
            <div className="text-xs text-gray-500 text-center mt-4 border-t pt-4">
              New to Flipkart?{' '}
              <Link to={`/register?redirect=${params.get('redirect') || ''}`} className="text-flipkart-blue font-bold hover:underline">
                Create an account
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Login;
