import AboutUs from "@/components/home/AboutUs";
import ContactUs from "@/components/home/ContactUs";
import CTA from "@/components/home/CTA";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import WhyUs from "@/components/home/WhyUs";

export default function Home() {
  return (
    <>
      <Hero />
      <main>
        <HowItWorks />
        <WhyUs />
        <CTA />
        <ContactUs />
      </main>
    </>
  );
}
