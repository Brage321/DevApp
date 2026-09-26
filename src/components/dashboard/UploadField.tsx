import { useRef, useState } from 'react';
import { ImagePlus, AudioLines, Check } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { getBackend } from '@/services/backend';
import { validateUpload } from '@/lib/security';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* UploadField — validated image/audio upload with drag & drop.        */
/* Files are validated (size, extension, magic bytes) before upload.   */
/* ------------------------------------------------------------------ */

interface Props {
  kind: 'avatar' | 'cover' | 'background' | 'audio';
  currentUrl?: string;
  onUploaded: (url: string) => void;
  label?: string;
  aspect?: 'square' | 'wide';
}

const KIND_ICONS = {
  avatar: ImagePlus,
  cover: ImagePlus,
  background: ImagePlus,
  audio: AudioLines,
};

export function UploadField({ kind, currentUrl, onUploaded, label, aspect = 'square' }: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [done, setDone] = useState(false);
  const Icon = KIND_ICONS[kind];
  const isAudio = kind === 'audio';

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setDone(false);
    try {
      const check = await validateUpload(file, isAudio ? 'audio' : kind === 'background' ? 'background' : 'avatar');
      if (!check.ok) {
        toast.error(check.error ?? 'Invalid file.');
        return;
      }
      const url = isAudio
        ? await getBackend().uploads.uploadAudio(file)
        : await getBackend().uploads.uploadImage(file, kind);
      onUploaded(url);
      setDone(true);
      toast.success('Upload complete.');
      window.setTimeout(() => setDone(false), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <span className="block text-[13px] font-medium text-ink-dim">{label}</span>}
      <div
        role="button"
        tabIndex={0}
        aria-label={label ?? 'Upload file'}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'group relative flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl border border-dashed transition-colors duration-200',
          aspect === 'square' ? 'h-24 w-24' : 'h-24 w-full',
          dragOver ? 'border-accent bg-accent/10' : 'border-line-strong bg-white/[0.03] hover:border-accent/50'
        )}
      >
        {currentUrl && !isAudio ? (
          <img src={currentUrl} alt="Current" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <>
            <Icon size={20} className="text-ink-faint transition-colors group-hover:text-ink-dim" />
            <span className="hidden text-xs text-ink-faint group-hover:text-ink-dim sm:block">
              {busy ? 'Uploading…' : 'Click or drop file'}
            </span>
          </>
        )}
        {done && (
          <span className="absolute inset-0 flex items-center justify-center bg-emerald-500/25">
            <Check size={22} className="text-emerald-300" />
          </span>
        )}
        {busy && <span className="absolute inset-0 animate-pulse bg-black/40" />}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={isAudio ? 'audio/mpeg,audio/ogg,audio/wav' : 'image/png,image/jpeg,image/webp,image/gif'}
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <p className="text-[11px] text-ink-faint">
        {isAudio ? 'MP3, OGG or WAV · max 10 MB' : 'PNG, JPEG, WEBP or GIF · max 5 MB'}
      </p>
    </div>
  );
}
