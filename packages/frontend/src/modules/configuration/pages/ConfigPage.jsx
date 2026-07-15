import React from 'react';
import WhitelistManager from '../components/WhitelistManager.jsx';
import BlacklistManager from '../components/BlacklistManager.jsx';

export default function ConfigPage() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Konfigurasi Moderasi</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Kelola parameter AI Anda. Tambahkan teman ke Whitelist dan musuh ke Blacklist.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <WhitelistManager />
        <BlacklistManager />
      </div>
    </div>
  );
}
