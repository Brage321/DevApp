import { LegalPage } from './LegalPage';

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The rules for using Kloa.lol — be human, be legal, be kind."
      path="/terms"
    >
      <p>
        By creating a Kloa.lol account you agree to the terms below. They are intentionally short
        and readable.
      </p>
      <h2>1. Your account</h2>
      <p>
        You are responsible for your account, your password, and the content you publish. Usernames
        are provided as-is on a first-come basis; usernames used for impersonation, phishing or
        harassment may be reclaimed or banned by moderators.
      </p>
      <h2>2. Acceptable use</h2>
      <ul>
        <li>No illegal content, malware, or phishing links.</li>
        <li>No harassment, hate speech, or impersonation of others.</li>
        <li>No automated abuse, scraping, or attempts to break rate limits.</li>
        <li>No content you don't have the rights to publish.</li>
      </ul>
      <h2>3. Content and moderation</h2>
      <p>
        You keep ownership of the content you publish. You grant Kloa.lol the limited right to host
        and display it. We may remove content or suspend accounts that violate these terms — reports
        submitted by users are reviewed through our moderation system.
      </p>
      <h2>4. Availability</h2>
      <p>
        The service is provided "as is". We aim for high availability but can't guarantee
        uninterrupted operation, and we may change or discontinue features over time.
      </p>
      <h2>5. Payments</h2>
      <p>
        No payment processing is implemented today. When paid plans launch, their terms will be
        published here before billing begins.
      </p>
    </LegalPage>
  );
}
