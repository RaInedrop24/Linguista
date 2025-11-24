'use client';

import { useRouter } from 'next/navigation';

export default function ResetProgressButton() {
    const router = useRouter();

    const handleReset = async () => {
        if (
            confirm(
                'Are you sure you want to reset ALL your learning progress? This cannot be undone and you will lose all your streaks and scores.'
            )
        ) {
            try {
                const res = await fetch('/api/user/reset-progress', { method: 'POST' });
                if (res.ok) {
                    alert('Progress reset successfully.');
                    router.refresh();
                } else {
                    alert('Failed to reset progress.');
                }
            } catch (e) {
                console.error(e);
                alert('An error occurred.');
            }
        }
    };

    return (
        <button
            onClick={handleReset}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
        >
            Reset Progress
        </button>
    );
}
