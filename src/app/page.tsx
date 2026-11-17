import PersonalTrainerLanding, { HomeStructuredData, ptMetadata } from "./pt/landing";

export const metadata = ptMetadata;

// ovrmn.com home: the waitlist landing. www.senec.ai shows the enterprise page here instead (next.config.ts).
export default function Home() {
  return (
    <>
      <HomeStructuredData />
      <PersonalTrainerLanding waitlist />
    </>
  );
}
