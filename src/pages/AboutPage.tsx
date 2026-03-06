import Navbar from "../components/Navbar";
import PrivacyPolicy from "../components/PrivacyPolicy";
import {
  HowToUseSection,
  IntroSection,
  FAQSection,
  Footer,
} from "../components/ContentSections";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar active="about" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">About</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
            How the calculator works, methodology, and privacy information.
          </p>
        </div>

        <HowToUseSection defaultOpen />
        <IntroSection defaultOpen />
        <FAQSection defaultOpen />
        <PrivacyPolicy />
      </div>

      <Footer />
    </div>
  );
}
