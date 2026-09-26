import { useDashboard } from '@/components/dashboard/DashboardContext';
import { UploadField } from '@/components/dashboard/UploadField';
import { Card } from '@/components/ui/Surfaces';
import { Field, Input, Textarea, Select, Slider } from '@/components/ui/Inputs';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { FILE_LIMITS } from '@/lib/config';
import { sanitizeBio, sanitizeText } from '@/lib/security';

/** Dashboard → Profile: identity, avatar & visibility. */
export default function ProfileSection() {
  const { profile, update } = useDashboard();
  if (!profile) return null;

  const setAvatar = (patch: Partial<typeof profile.avatar>) =>
    update({ avatar: { ...profile.avatar, ...patch } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-ink-dim">Your identity basics — name, bio, avatar and visibility.</p>
      </header>

      <Card className="space-y-5">
        <h2 className="font-display text-sm font-semibold text-white">Identity</h2>
        <Field
          label="Display name"
          hint={`Shown above your username · max ${FILE_LIMITS.displayNameMax} chars`}
          htmlFor="dn"
        >
          <Input
            id="dn"
            value={profile.displayName}
            maxLength={FILE_LIMITS.displayNameMax}
            onChange={(e) => update({ displayName: sanitizeText(e.target.value, FILE_LIMITS.displayNameMax) })}
            placeholder="Your name"
          />
        </Field>
        <Field
          label="Bio"
          hint={`${profile.bio.length}/${FILE_LIMITS.bioMax} · line breaks and emoji supported (rendered as plain text — no HTML)`}
          htmlFor="bio"
        >
          <Textarea
            id="bio"
            value={profile.bio}
            maxLength={FILE_LIMITS.bioMax}
            onChange={(e) => update({ bio: sanitizeBio(e.target.value) })}
            placeholder="Tell the world who you are…"
            rows={4}
          />
        </Field>
        <Field label="Username" hint="Usernames are permanent — they are your kloa.lol address.">
          <Input value={profile.username} disabled className="opacity-60" />
        </Field>
        <Field
          label="Visibility"
          hint="Private profiles are only visible to you. Unlisted profiles skip Explore/search."
        >
          <Select
            value={profile.visibility}
            onChange={(e) => update({ visibility: e.target.value as typeof profile.visibility })}
            options={[
              { value: 'public', label: 'Public — listed on Explore' },
              { value: 'unlisted', label: 'Unlisted — accessible by link only' },
              { value: 'private', label: 'Private — only you can view' },
            ]}
          />
        </Field>
      </Card>

      <Card className="space-y-5">
        <h2 className="font-display text-sm font-semibold text-white">Avatar</h2>
        <div className="flex flex-wrap items-start gap-6">
          <UploadField
            kind="avatar"
            label="Upload image"
            currentUrl={profile.avatar.url}
            onUploaded={(url) => setAvatar({ url })}
          />
          <div className="min-w-52 flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Shape">
                <Select
                  value={profile.avatar.shape}
                  onChange={(e) => setAvatar({ shape: e.target.value as typeof profile.avatar.shape })}
                  options={[
                    { value: 'circle', label: 'Circle' },
                    { value: 'rounded', label: 'Rounded square' },
                  ]}
                />
              </Field>
              <Slider
                label="Size"
                value={profile.avatar.size}
                min={72}
                max={160}
                onChange={(v) => setAvatar({ size: v })}
                suffix="px"
              />
            </div>
            {profile.avatar.shape === 'rounded' && (
              <Slider
                label="Corner radius"
                value={profile.avatar.radius}
                min={0}
                max={64}
                onChange={(v) => setAvatar({ radius: v })}
                suffix="px"
              />
            )}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Slider
            label="Border width"
            value={profile.avatar.borderWidth}
            min={0}
            max={8}
            onChange={(v) => setAvatar({ borderWidth: v })}
            suffix="px"
          />
          <ColorPicker
            label="Border color"
            value={profile.avatar.borderColor}
            onChange={(v) => setAvatar({ borderColor: v })}
          />
          <Slider
            label="Glow"
            value={profile.avatar.glow}
            min={0}
            max={100}
            onChange={(v) => setAvatar({ glow: v })}
          />
          <Slider
            label="Shadow"
            value={profile.avatar.shadow}
            min={0}
            max={100}
            onChange={(v) => setAvatar({ shadow: v })}
          />
        </div>
      </Card>
    </div>
  );
}
