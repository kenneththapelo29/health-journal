"use client";

import Link from 'next/link';
import SignIn from '@/components/SignIn';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="max-w-md w-full space-y-8 relative z-10 px-4">
        {/* Back to home link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition-all duration-200 hover:gap-3 group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back Home
          </Link>
        </div>

        {/* Sign-in card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-purple-100 transform transition-all duration-300 hover:shadow-purple-200/50">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your health journal
            </p>
          </div>

          {/* SignIn component */}
          <SignIn />

          {/* Additional links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-purple-600 hover:text-purple-700 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center text-xs text-gray-600 space-y-2">
          <p className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure authentication
          </p>
        </div>
      </div>
    </div>
  );
}
