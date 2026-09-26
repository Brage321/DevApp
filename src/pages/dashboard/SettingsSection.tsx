import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, AlertTriangle, RotateCcw } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/ui/Surfaces';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Inputs';
import { Modal } from '@/components/ui/Surfaces';
import { isDemoMode, getBackend } from '@/services/backend';
import { resetDemoData } from '@/services/demoBackend';

/** Dashboard → Settings: account, export, demo reset, danger zone. */
export default function SettingsSection() {
  const { profile } = useDashboard();
  const { user, signOut, updatePassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const exportProfile = () => {
    if (!profile) return;
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kloa-${profile.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Profile exported.');
  };

  const changePassword = async () => {
    if (pw.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (pw !== confirmPw) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      await updatePassword(pw);
      toast.success('Password updated.');
      setPw('');
      setConfirmPw('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update password.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-ink-dim">Account, data and danger-zone controls.</p>
      </header>

      <Card className="space-y-4">
        <h2 className="font-display text-sm font-semibold text-white">Account</h2>
        <Field label="Email" hint="Email changes require verification — contact support.">
          <Input value={user?.email ?? ''} disabled className="opacity-60" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" htmlFor="spw">
            <Input id="spw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          </Field>
          <Field label="Confirm password" htmlFor="spw2">
            <Input id="spw2" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          </Field>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void changePassword()}>
          Update password
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-sm font-semibold text-white">Your data</h2>
        <p className="text-xs leading-relaxed text-ink-dim">
          Export your full profile configuration as JSON — themes, links, effects and settings.
        </p>
        <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={exportProfile}>
          Export profile JSON
        </Button>
        {isDemoMode && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={() => {
                resetDemoData();
                window.location.href = '/';
              }}
            >
              Reset demo data
            </Button>
            <span className="text-[11px] text-ink-faint">restores the original demo profiles</span>
          </div>
        )}
      </Card>

      <Card className="space-y-3 border-red-500/20">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-red-300">
          <AlertTriangle size={15} /> Danger zone
        </h2>
        <p className="text-xs leading-relaxed text-ink-dim">
          Deleting your profile removes your page and all links permanently. This action cannot be
          undone.
        </p>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          Delete my profile
        </Button>
      </Card>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete profile?">
        <p className="text-sm leading-relaxed text-ink-dim">
          This permanently deletes <span className="text-ink">kloa.lol/{profile?.username}</span> and
          its content. There is no undo.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              void getBackend_delete();
            }}
          >
            Delete forever
          </Button>
        </div>
      </Modal>
    </div>
  );

  async function getBackend_delete() {
    try {
      await getBackend().profiles.deleteOwn();
      toast.success('Profile deleted.');
      await signOut();
      navigate('/');
    } catch {
      toast.error('Could not delete profile. Please try again.');
    }
  }
}
