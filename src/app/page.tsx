import { LandingHero } from "@/components/landing-new/LandingHero";
import { LandingMarquee } from "@/components/landing-new/LandingMarquee";
import { LandingFeatures } from "@/components/landing-new/LandingFeatures";
import { LandingTrending } from "@/components/landing-new/LandingTrending";
import { NavigationOverlayPill } from "@/components/NavigationOverlayPill";
import { PromoModal } from "@/components/PromoModal";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <PromoModal />
      <main className="flex-1 relative z-10">
        <LandingHero />
        <LandingFeatures />
        <LandingTrending />
      </main>
      <NavigationOverlayPill />  
    </div>  
  );
}
