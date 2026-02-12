"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  Lightning,
  LinkedinLogo,
  Sparkle,
  Star,
  X,
} from "phosphor-react";
import { useEffect, useState } from "react";
import GetStarted from "./extras/GetStarted";
import LoginPopup from "./extras/Login";
import { jwtDecode } from "jwt-decode";
import { FaBarsStaggered, FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import LegalDocumentsModal from "./DocModal";
import Hero from "./Hero";
import Navbar from "./Navbar";
import HowItWorks from "./HowItWorks";
import Footer from "./Footer";
import ContactUs from "./ContactUs";
import CTA from "./CTA";
import CaseStudies from "./CaseStudies";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [getStarted, setGetStarted] = useState<boolean>(false);
  const [login, setLogin] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [showLegalDocs, setShowLegalDocs] = useState<boolean>(false);
  const [initialDoc, setInitialDoc] = useState<string>("privacy");

  const openPopup = () => {
    setIsMobileMenuOpen(false);
    setGetStarted(true);
  };

  const openLogin = () => {
    setIsMobileMenuOpen(false);
    setLogin(true);
  };

  useEffect(() => {
    const checkToken = () => {
      const userStr = localStorage.getItem("user");

      if (!userStr) {
        setLoggedIn(false);
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        const token = userData?.data?.access_token || userData?.access_token;

        if (!token) {
          setLoggedIn(false);
          return;
        }

        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp > currentTime) {
          setLoggedIn(true);
        } else {
          localStorage.removeItem("user");
          setLoggedIn(false);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setLoggedIn(false);
      }
    };

    checkToken();
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  return (
    <>
      <AnimatePresence>
        {getStarted && (
          <GetStarted
            onClose={() => setGetStarted(false)}
            login={() => setLogin(true)}
          />
        )}
        {login && <LoginPopup onClose={() => setLogin(false)} isOpen={login} />}
        {showLegalDocs && (
          <LegalDocumentsModal
            isVisible={showLegalDocs}
            onClose={() => setShowLegalDocs(false)}
            initialDocument={initialDoc}
          />
        )}
      </AnimatePresence>

      <Navbar openLogin={openLogin} openPopup={openPopup} />
      <Hero openPopup={openPopup} />
      <HowItWorks />
      <CaseStudies />
      <CTA openPopup={openPopup} />
      <ContactUs />
      <Footer
        setInitialDoc={setInitialDoc}
        setShowLegalDocs={setShowLegalDocs}
      />
    </>
  );
}
