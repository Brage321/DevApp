import { LegalPage } from './LegalPage';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How Kloa.lol handles your data — minimum collection, no ad tracking, full control."
      path="/privacy"
    >
      <p>
        Kloa.lol is built to collect as little personal data as possible. This policy explains what
        we collect, why, and the controls you have. It does not claim compliance with any specific
        certification program; it is an honest description of current behavior.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> your email address and chosen username, used to authenticate
          you and display your profile.
        </li>
        <li>
          <strong>Profile content:</strong> the display name, bio, links, theme and media you upload.
          This is public by definition if your profile is public.
        </li>
        <li>
          <strong>Aggregate analytics:</strong> when someone visits a profile we record an anonymous
          view event (device category and browser family, day bucket). We do not store IP addresses
          in analytics, do not use advertising trackers, and do not build cross-site profiles.
        </li>
      </ul>
      <h2>What we don't do</h2>
      <ul>
        <li>We don't sell or share your personal data with advertisers.</li>
        <li>We don't require personal information beyond an email address.</li>
        <li>We don't keep analytics history tied to identifiable visitors.</li>
      </ul>
      <h2>Your controls</h2>
      <ul>
        <li>Set your profile to public, unlisted or private at any time from the dashboard.</li>
        <li>Delete your profile and account from dashboard settings.</li>
        <li>Request a data export by contacting us.</li>
      </ul>
      <h2>Contact</h2>
      <p>
        Questions about privacy? Reach us via the <a className="text-accent-soft underline" href="/contact">contact page</a>.
      </p>
    </LegalPage>
  );
}
