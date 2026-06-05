import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Key, ShieldAlert } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      return setError('Please fill out all password fields.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setSuccess('Password reset successfully! Redirecting to login in 3 seconds...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm shadow-sm transition-colors p-6 flex flex-col gap-4">
        
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-1.5 border-b pb-3">
          <Key className="w-5 h-5 text-flipkart-blue" /> Choose New Password
        </h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-2.5 rounded text-xs font-semibold flex items-center gap-1.5 border border-red-100 dark:border-red-900">
            <ShieldAlert className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 p-2.5 rounded text-xs font-semibold border border-green-100 dark:border-green-900">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">New Password</label>
            <div className="flex items-center bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 rounded-sm overflow-hidden px-2.5">
              <Key className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent px-2.5 py-2 text-sm outline-none border-none text-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Confirm New Password</label>
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
            className="w-full bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold py-2.5 rounded-sm text-xs shadow-sm disabled:opacity-50 transition-colors mt-2"
          >
            {submitting ? 'RESETTING...' : 'RESET PASSWORD'}
          </button>
        </form>

        <Link to="/login" className="text-xs text-flipkart-blue font-bold hover:underline text-center">
          Back to Login
        </Link>

      </div>
    </div>
  );
};

export default ResetPassword;
