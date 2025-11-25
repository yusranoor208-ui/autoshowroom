'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { AlertCircle, Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('checking'); // checking, sent, verified, error
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = async () => {
      try {
        // If no user is logged in, check localStorage for pending verification
        if (!auth.currentUser) {
          const pendingVerification = localStorage.getItem('pendingVerification');
          if (pendingVerification) {
            const { email, timestamp } = JSON.parse(pendingVerification);
            // Check if the verification link is still valid (24 hours)
            if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
              setStatus('error');
              setError('Verification link has expired. Please sign up again.');
              localStorage.removeItem('pendingVerification');
              return;
            }
            setEmail(email);
            setStatus('sent');
            startCountdown();
          } else {
            // No pending verification found
            router.push('/signup');
            return;
          }
        } else {
          // User is logged in, check verification status
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            setStatus('verified');
            // Clear the pending verification from localStorage
            localStorage.removeItem('pendingVerification');
            return;
          }
          
          // User is logged in but not verified
          setEmail(auth.currentUser.email);
          setStatus('sent');
          startCountdown();
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setError('An error occurred while checking your verification status.');
      }
    };

    checkVerification();
    
    // Set up a timer to check verification status periodically
    const interval = setInterval(checkVerification, 5000);
    
    return () => clearInterval(interval);
  }, [router]);

  const startCountdown = () => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendVerification = async () => {
    try {
      setStatus('checking');
      await sendEmailVerification(auth.currentUser);
      setStatus('sent');
      startCountdown();
    } catch (error) {
      console.error('Resend error:', error);
      setStatus('error');
      setError('Failed to resend verification email. Please try again.');
    }
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Checking your email...</h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (status === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-8">Your email has been successfully verified. You can now log in to your account.</p>
          <Link 
            href="/login"
            className="inline-block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification link to <span className="font-semibold">{email}</span>
          </p>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="bg-purple-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-purple-800 mb-2">Didn't receive the email?</h3>
          <p className="text-sm text-purple-700 mb-4">
            Check your spam folder or click the button below to resend the verification email.
          </p>
          <button
            onClick={handleResendVerification}
            disabled={countdown > 0 || status === 'checking'}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
              countdown > 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {status === 'checking' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
              </>
            )}
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Entered the wrong email?</p>
          <Link 
            href="/signup" 
            className="text-purple-600 font-medium hover:underline"
            onClick={() => {
              auth.signOut();
              localStorage.removeItem('pendingVerification');
            }}
          >
            Go back to sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
