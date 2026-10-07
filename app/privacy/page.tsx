import type { Metadata } from 'next';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy policy for brocco.dev: what we collect, what we do not, and how we keep your data yours.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-24">
        <div className="container-x max-w-3xl">
          <p className="pill">Privacy</p>
          <h1 className="mt-5 text-display-lg text-grad">Your data is yours.</h1>
          <p className="mt-4 text-[15px] text-ink-dim">Last updated: 2026-10-07.</p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink-dim">
            <Section title="Account and sign-in information">
              <p>We store your account email, name and profile image when provided, account identifiers, and email verification status. Google sign-in requests only basic identity information: email, profile, and OpenID. Apple sign-in requests your name and email, which may be an Apple private relay address. We use this information to create your account, recognize you when you return, and associate your projects and subscription with you.</p>
              <p className="mt-3">Our authentication system stores provider account records and returned authentication tokens, plus session records that can include your IP address and browser information. First-party cookies keep you signed in. If you choose email sign-in, Resend receives your email address and a temporary sign-in link to deliver the message.</p>
            </Section>
            <Section title="Projects, conversations, and model requests">
              <p>Saved projects and conversations can include your prompts, agent responses, project memory, and activity summaries. These are stored in our database so you can return to your work, and some are cached in your browser. When you run an agent, the selected model provider receives the prompt, context, and any supported attachments included in that request.</p>
              <p className="mt-3">Where hosted AI is available, our server sends model requests to Anthropic and may send generated search queries to Tavily when search is enabled. Web tools can send requested URLs and search queries through our server to public websites. The providers you use also process data under their own policies; we do not promise zero retention by those providers.</p>
            </Section>
            <Section title="Bring your own key (BYOK)">
              <p>Your Anthropic or xAI API key is saved in this browser&apos;s local storage and sent directly to that provider for model requests. It is not saved in our account database. You can remove it from the API key panel. This does not prevent saved conversation content or web-tool requests from reaching our server as described above.</p>
            </Section>
            <Section title="Billing">
              <p>Stripe processes checkout and payment details. We use Stripe customer and subscription identifiers, billing email, payment status, and plan information to connect a subscription to your Brocco account and control access. A first-party checkout cookie helps you resume an unfinished checkout or cancel an unclaimed trial. We retain account trial-claim records to prevent duplicate trials. We do not store your full card number in our database.</p>
            </Section>
            <Section title="Cookies, local storage, and analytics">
              <p>We use first-party cookies and browser storage for sign-in, preferences, consent choices, and cached project data. Vercel Analytics and Speed Insights collect page and performance metrics. When configured and you accept analytics cookies, PostHog collects page views and product interactions, including click activity, and can associate those events with your signed-in account.</p>
              <p className="mt-3">When Meta Pixel is configured and you accept marketing cookies, it reports page views and conversion events to Meta. Separately, if server-side Meta conversion reporting is configured, our Stripe webhook sends checkout completion events with a hashed email address, checkout identifier, amount, and currency to Meta.</p>
            </Section>
            <Section title="Service providers">
              <p>We use Vercel for hosting and site metrics, Neon for database storage, Resend for sign-in email, and Stripe for billing. Google or Apple handles social sign-in when selected. Model and search providers can include Anthropic, xAI, and Tavily, depending on the features and provider you use. PostHog is used for optional analytics when configured and consented to. Meta can receive marketing and conversion data when those integrations are configured, as described above.</p>
            </Section>
            <Section title="Your information">
              <p>Email <a className="text-cyan-glow underline-offset-4 hover:underline" href="mailto:privacy@brocco.dev">privacy@brocco.dev</a> to ask about your data or request access, correction, export, or deletion. We may need to verify your account ownership before acting on a request.</p>
            </Section>
            <Section title="Children">
              <p>Brocco requires users to be at least 18. We do not knowingly collect data from children.</p>
            </Section>
            <Section title="Changes">
              <p>We will post updates to this policy here and revise the date above.</p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[18px] font-semibold tracking-tight text-white">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
