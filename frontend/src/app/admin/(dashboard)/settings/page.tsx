'use client';

import { useEffect, useState } from 'react';

interface Settings {
  platformFee: number;
  depositAmount: number;
  waitlistAdvance: number;
  termsAndConditions: string;
  pickupLocations: string[];
  totpEnabled: boolean;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0d2a20] border border-[#163a2c] rounded-[10px] p-5 mb-5">
      <h2 className="text-[14px] font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-3.5 py-2.5 bg-[#0a2018] border border-[#1f4a38] rounded-[8px] text-[13px] text-white focus:outline-none focus:border-[#0F6E56]';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const [platformFee, setPlatformFee] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [waitlistAdvance, setWaitlistAdvance] = useState('');
  const [terms, setTerms] = useState('');
  const [locationsText, setLocationsText] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [addAdminMsg, setAddAdminMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load settings');
        setSettings(body.settings);
        setPlatformFee(String(body.settings.platformFee));
        setDepositAmount(String(body.settings.depositAmount));
        setWaitlistAdvance(String(body.settings.waitlistAdvance));
        setTerms(body.settings.termsAndConditions);
        setLocationsText(body.settings.pickupLocations.join('\n'));
      })
      .catch((e) => setError(e.message));
  }, []);

  const saveGeneral = async () => {
    setError('');
    setSavedMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformFee: Number(platformFee),
          depositAmount: Number(depositAmount),
          waitlistAdvance: Number(waitlistAdvance),
          termsAndConditions: terms,
          pickupLocations: locationsText.split('\n').map((l) => l.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      setSavedMsg('Saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  const changePassword = async () => {
    setPasswordMsg('');
    setError('');
    try {
      const res = await fetch('/api/admin/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to change password');
      setPasswordMsg('Password changed.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  const addAdmin = async () => {
    setAddAdminMsg('');
    setError('');
    try {
      const res = await fetch('/api/admin/settings/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newAdminPhone, tempPassword: newAdminPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add admin');
      setAddAdminMsg('Admin added.');
      setNewAdminPhone('');
      setNewAdminPassword('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  if (!settings) return <p className="text-[13px] text-[#9fd8bc]">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-[24px] text-white mb-6">Settings</h1>

      {error && <p className="text-[13px] text-[#f5b0b0] mb-4">{error}</p>}

      <Section title="Change admin password">
        <div className="space-y-3 max-w-[360px]">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className={inputClass} />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className={inputClass} />
          <button onClick={changePassword} className="px-4 py-2 text-[12px] font-bold bg-[#0F6E56] text-white rounded-[8px] hover:bg-[#085041]">
            Update password
          </button>
          {passwordMsg && <p className="text-[12px] text-[#7adbb4]">{passwordMsg}</p>}
        </div>
      </Section>

      <Section title="Add new admin">
        <div className="space-y-3 max-w-[360px]">
          <input value={newAdminPhone} onChange={(e) => setNewAdminPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Phone number" className={inputClass} />
          <input type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} placeholder="Temporary password" className={inputClass} />
          <button onClick={addAdmin} className="px-4 py-2 text-[12px] font-bold bg-[#0F6E56] text-white rounded-[8px] hover:bg-[#085041]">
            Add admin
          </button>
          {addAdminMsg && <p className="text-[12px] text-[#7adbb4]">{addAdminMsg}</p>}
        </div>
      </Section>

      <Section title="Two-factor authentication">
        <label className="flex items-center gap-3 opacity-60 cursor-not-allowed">
          <input type="checkbox" disabled checked={false} className="w-4 h-4" />
          <span className="text-[13px] text-white">Google Authenticator (TOTP)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3a2e14] text-[#f5d6a8]">Coming soon</span>
        </label>
      </Section>

      <Section title="Pickup &amp; return locations">
        <textarea
          value={locationsText}
          onChange={(e) => setLocationsText(e.target.value)}
          placeholder="One location per line"
          rows={4}
          className={inputClass}
        />
      </Section>

      <Section title="Terms &amp; conditions text">
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          rows={6}
          className={inputClass}
        />
      </Section>

      <Section title="Pricing defaults">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[560px]">
          <div>
            <label className="block text-[11px] font-semibold text-[#9fd8bc] mb-1.5">Platform fee (₹)</label>
            <input value={platformFee} onChange={(e) => setPlatformFee(e.target.value.replace(/\D/g, ''))} className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#9fd8bc] mb-1.5">Deposit amount (₹)</label>
            <input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value.replace(/\D/g, ''))} className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#9fd8bc] mb-1.5">Waitlist advance (₹)</label>
            <input value={waitlistAdvance} onChange={(e) => setWaitlistAdvance(e.target.value.replace(/\D/g, ''))} className={inputClass} />
          </div>
        </div>
      </Section>

      <button onClick={saveGeneral} className="px-5 py-2.5 text-[13px] font-bold bg-[#0F6E56] text-white rounded-[8px] hover:bg-[#085041]">
        Save all settings
      </button>
      {savedMsg && <p className="text-[12px] text-[#7adbb4] mt-2">{savedMsg}</p>}
    </div>
  );
}
