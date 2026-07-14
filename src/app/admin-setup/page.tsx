'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// SECURITY: This page is disabled in production
// Only accessible in development mode for initial setup

export default function AdminSetup() {
  const router = useRouter();

  useEffect(() => {
    // Block access in production
    if (process.env.NODE_ENV === 'production') {
      router.push('/');
      return;
    }

    // Block access if ENABLE_ADMIN_SETUP is not explicitly set
    if (process.env.NEXT_PUBLIC_ENABLE_ADMIN_SETUP !== 'true') {
      router.push('/');
      return;
    }
  }, [router]);

  // In production or if not enabled, show nothing
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ADMIN_SETUP !== 'true') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b2a] via-[#102a5c] to-[#7b2ff7] p-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              ⚠️ Admin Setup - Development Only
            </h1>
            <p className="text-white/80">
              This page is only accessible in development mode.
            </p>
            <p className="text-white/60 text-sm mt-2">
              In production, create admin users directly from Firebase Console.
            </p>
          </div>

          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm">
              <strong>Security Note:</strong> This page is automatically disabled in production.
              To enable in development, set <code>NEXT_PUBLIC_ENABLE_ADMIN_SETUP=true</code> in your .env.local file.
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-6">
            <h2 className="text-white font-semibold mb-3">How to create admin user in production:</h2>
            <ol className="text-white/80 text-sm space-y-2 list-decimal list-inside">
              <li>Go to Firebase Console → Authentication</li>
              <li>Add user with email and password</li>
              <li>Go to Firestore → users collection</li>
              <li>Create document with user UID as ID</li>
              <li>Set role: "admin", isActive: true</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
