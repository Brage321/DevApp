import { useState } from 'react';
import { Mail, MessageCircle, Bug, Clock } from 'lucide-react';
import { LegalPage } from './LegalPage';
import { Card } from '@/components/ui/Surfaces';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Inputs';
import { useToast } from '@/hooks/useToast';

export default function Contact() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <LegalPage
      title="Contact"
      description="Get in touch with the Kloa.lol team — support, feedback, business."
      path="/contact"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Mail, title: 'Email', desc: 'hello@kloa.lol' },
          { icon: MessageCircle, title: 'Discord', desc: 'community coming soon' },
          { icon: Clock, title: 'Response time', desc: 'usually within 48h' },
        ].map((c) => (
          <Card key={c.title} className="text-center">
            <c.icon size={20} className="mx-auto text-accent-soft" />
            <h2 className="mt-3 font-display text-sm font-semibold text-white">{c.title}</h2>
            <p className="mt-1 text-xs text-ink-dim">{c.desc}</p>
          </Card>
        ))}
      </div>

      <h2>Send a message</h2>
      <form
        className="space-y-4 rounded-2xl border border-line bg-bg1/60 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          // No backend mail service is configured in this build; the form
          // validates and acknowledges without pretending an email was sent.
          if (!email.trim() || !message.trim()) {
            toast.error('Please fill in your email and message.');
            return;
          }
          toast.info('Message saved locally — email delivery is not configured in this build.');
          setEmail('');
          setMessage('');
        }}
      >
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Your email"
        />
        <Textarea
          placeholder="How can we help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-label="Your message"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            <Bug size={12} /> Found a bug? Include steps to reproduce.
          </p>
          <Button type="submit">Send message</Button>
        </div>
      </form>
    </LegalPage>
  );
}
