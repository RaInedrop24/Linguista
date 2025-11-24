'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
            Sign Out
        </button>
    );
}
