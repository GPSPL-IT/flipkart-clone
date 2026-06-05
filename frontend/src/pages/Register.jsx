import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Key, ShieldAlert } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Extract redirect query parameter if exists
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get('redirect') ? `/${params.get('redirect')}` : '/';

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!name || !email || !password || !confirmPassword) {
      return setAuthError('Please fill out all registration fields.');
    }

    if (password !== confirmPassword) {
      return setAuthError('Passwords do not match.');
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate(redirectPath);
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm shadow-sm transition-colors overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Branding Banner Block for Flipkart look */}
        <div className="bg-flipkart-blue text-white p-6 md:w-2/5 flex flex-col justify-between hidden md:flex">
          <div>
            <h3 className="text-xl font-bold">Register</h3>
            <p className="text-xs text-blue-100 mt-2 leading-relaxed">
              Sign up to unlock exclusive discounts, tracks orders, and create wishlists.
            </p>
          </div>
          <span className="text-xl font-black italic tracking-wide text-white/20 select-none">
            Flipkart
          </span>
        </div>

        {/* Right Form Fields Panel */}
        <div className="p-6 flex-1 flex flex-col gap-4">
          <div className="md:hidden">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Create an Account
            </h3>
          </div>

          {authError && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-2.5 rounded text-xs font-semibold flex items-center gap-1.5 border border-red-100 dark:border-red-900">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Full Name</label>
              <div className="flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 rounded-sm overflow-hidden px-2.5">
                <User className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter First & Last Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent px-2.5 py-2 text-sm outline-none border-none text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Email Address</label>
              <div className="flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 rounded-sm overflow-hidden px-2.5">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent px-2.5 py-2 text-sm outline-none border-none text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Password</label>
              <div className="flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 rounded-sm overflow-hidden px-2.5">
                <Key className="w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent px-2.5 py-2 text-sm outline-none border-none text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Confirm Password</label>
              <div className="flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 rounded-sm overflow-hidden px-2.5">
                <Key className="w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent px-2.5 py-2 text-sm outline-none border-none text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-flipkart-orange hover:bg-flipkart-orange-dark text-white font-bold py-2.5 rounded-sm text-xs shadow-sm disabled:opacity-50 transition-colors mt-2"
            >
              {submitting ? 'CREATING ACCOUNT...' : 'REGISTER'}
            </button>
          </form>

          {/* Bottom Redirect */}
          <div className="text-xs text-gray-500 text-center mt-4 border-t pt-4">
            Already have an account?{' '}
            <Link to={`/login?redirect=${params.get('redirect') || ''}`} className="text-flipkart-blue font-bold hover:underline">
              Login here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;
