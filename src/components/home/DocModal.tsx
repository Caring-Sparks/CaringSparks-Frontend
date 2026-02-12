"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { X } from "phosphor-react";

const LegalDocumentsModal = ({
  isVisible,
  onClose,
  initialDocument = "privacy",
}: {
  isVisible: boolean;
  onClose: () => void;
  initialDocument?: string;
}) => {
  const [selectedDoc, setSelectedDoc] = useState(initialDocument);

  useEffect(() => {
    setSelectedDoc(initialDocument);
  }, [initialDocument]);

  if (!isVisible) return null;

  const backdrop = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modal = {
    hidden: { y: "-100vh", opacity: 0, scale: 0.9 },
    visible: {
      y: "0",
      opacity: 1,
      scale: 1,
      transition: { delay: 0.1, duration: 0.3 },
    },
    exit: { y: "100vh", opacity: 0, scale: 0.9 },
  };

  const documents = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-3">
          <section>
            <h3 className="text-xl font-bold mb-3">1. Introduction</h3>
            <p>
              Welcome to <strong>ThePrGod</strong>. We value your privacy and
              are committed to protecting your personal information. This
              Privacy Policy explains how we collect, use, disclose, and protect
              your information when you use our website, services, and platform
              (collectively, the &quot;Services&quot;).
            </p>
            <p className="mt-2">
              By accessing or using our Services, you agree to the terms
              outlined in this Privacy Policy. If you do not agree, please do
              not use our website or services.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              2. Information We Collect
            </h3>
            <h4 className="font-semibold mt-3 mb-2">A. Personal Information</h4>
            <p>
              When you register or interact with our platform, we may collect:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Full name, Email address, Phone number</li>
              <li>Social media handles or links</li>
              <li>
                Payment and billing information (for payouts and promotions)
              </li>
              <li>Profile picture and biography</li>
              <li>Location data (city and country)</li>
            </ul>
            <h4 className="font-semibold mt-3 mb-2">
              B. Non-Personal Information
            </h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Browser type and version, Device type and operating system
              </li>
              <li>Pages visited, duration of visit, and referral sources</li>
              <li>Cookies and tracking technologies</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              3. How We Use Your Information
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>To create and manage your user or influencer account</li>
              <li>To connect influencers with clients and campaigns</li>
              <li>To process payments, commissions, and withdrawals</li>
              <li>
                To communicate with you about updates, offers, and opportunities
              </li>
              <li>To improve our services and website experience</li>
              <li>
                To comply with legal obligations and prevent fraudulent
                activities
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              4. How We Share Your Information
            </h3>
            <p className="mb-2">
              We may share your information in the following situations:
            </p>
            <div className="space-y-2">
              <p>
                <strong>With Clients or Advertisers:</strong> When you apply for
                or accept a campaign, certain profile information may be visible
                to brands.
              </p>
              <p>
                <strong>With Service Providers:</strong> We may use third-party
                vendors to support our business operations.
              </p>
              <p>
                <strong>For Legal Compliance:</strong> If required by law, court
                order, or government regulation.
              </p>
              <p>
                <strong>Business Transfers:</strong> In case of a merger, sale,
                or transfer of assets.
              </p>
            </div>
            <p className="mt-2 font-semibold">
              We do NOT sell your personal data to any third party.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">5. Your Rights</h3>
            <p>
              Under the <strong>Nigeria Data Protection Act (NDPA) 2023</strong>
              , you have the right to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Request access to your personal data</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>
                Request restriction or object to certain types of processing
              </li>
              <li>
                File a complaint with the Nigeria Data Protection Commission
                (NDPC)
              </li>
            </ul>
            <p className="mt-2">
              To exercise your rights, contact us at{" "}
              <a
                href="mailto:support@theprgod.com"
                className="text-blue-600 underline"
              >
                support@theprgod.com
              </a>
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">6. Data Security</h3>
            <p>
              We implement reasonable administrative, technical, and physical
              safeguards to protect your data from unauthorized access, loss,
              misuse, or alteration. However, no internet-based platform is 100%
              secure. You use our services at your own risk.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">7. Cookies and Tracking</h3>
            <p>We use cookies and similar technologies to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Personalize your user experience</li>
              <li>Analyze website traffic and performance</li>
              <li>Remember your preferences</li>
            </ul>
            <p className="mt-2">
              You can disable cookies in your browser settings, but some site
              features may not function properly.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">8. Data Retention</h3>
            <p>
              We retain your personal data only for as long as necessary to
              provide our services, fulfill legal obligations, or resolve
              disputes. When your account is deleted, we securely remove or
              anonymize your data unless required to keep it for legal or
              financial reasons.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              9. International Data Transfers
            </h3>
            <p>
              As ThePrGod operates online, your information may be transferred
              to and processed in countries outside Nigeria. We ensure that such
              transfers comply with applicable data protection laws and maintain
              adequate safeguards.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">10. Children’s Privacy</h3>
            <p>
              Our services are not intended for children under the age of 18. We
              do not knowingly collect personal information from minors. If you
              believe a child has provided us data, contact us immediately to
              remove it.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              11. Updates to This Policy
            </h3>
            <p>
              We may update this Privacy Policy occasionally. The revised
              version will be posted on this page with a new “Effective Date.”
              We encourage you to review it regularly to stay informed.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">12. Contact Us</h3>
            <p>
              <strong>ThePrGod</strong>
              <br />
              Abuja, Nigeria
              <br />
              📧{" "}
              <a
                href="mailto:support@theprgod.com"
                className="text-blue-600 underline"
              >
                support@theprgod.com
              </a>
              <br />
              🌐{" "}
              <a
                href="https://theprgod.com"
                className="text-blue-600 underline"
              >
                https://theprgod.com
              </a>
            </p>
          </section>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      content: (
        <div className="space-y-3">
          <section>
            <h3 className="text-xl font-bold mb-3">1. Introduction</h3>
            <p>
              Welcome to <strong>ThePrGod</strong> (&quot;Company,&quot;
              &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These{" "}
              <strong>Terms of Service</strong> (&quot;Terms&quot;) govern your
              access to and use of our website, platform, and services.
            </p>
            <p className="mt-2">
              By accessing or using our Services, you agree to these Terms. If
              you do not agree, you may not use ThePrGod. These Terms form a
              legally binding agreement between you and ThePrGod, headquartered
              in Abuja, Nigeria.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              2. Description of the Service
            </h3>
            <p>
              <strong>ThePrGod</strong> is a managed influencer marketing
              platform that connects brands, businesses, and individuals with
              micro-influencers to promote products, services, or events.
            </p>
            <p className="mt-2">
              Unlike traditional marketplaces,{" "}
              <strong>ThePrGod fully manages each campaign</strong> — from
              influencer selection and communication to content delivery,
              verification, and payment release. All Clients on ThePrGod deal
              exclusively with ThePrGod as Influencers complete jobs assigned
              and monitored by ThePrGod. The Payments flow through ThePrGod and
              are released only upon verified completion of agreed tasks.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">3. Eligibility</h3>
            <p>To use ThePrGod, you must:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Be at least <strong>18 years old</strong>
              </li>
              <li>
                Use accurate and verifiable personal or business information
              </li>
              <li>
                Comply with all applicable laws of the{" "}
                <strong>Federal Republic of Nigeria</strong>
              </li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these conditions.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">4. Account Registration</h3>
            <p>
              All users must register for an account to access services. You
              agree to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Provide accurate and current information during registration
              </li>
              <li>Keep your login credentials confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p>
              ThePrGod is not responsible for losses caused by failure to secure
              your account.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">5. Role of ThePrGod</h3>
            <p>ThePrGod acts as:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>A third-party manager for influencer campaigns</li>
              <li>
                The contracting and payment intermediary between Clients and
                Influencers{" "}
              </li>
              <li>
                The administrator ensuring deliverables meet campaign standards
              </li>
            </ul>
            <p>
              Clients do not contact influencers directly. All campaign
              discussions, approvals, and disputes are handled through ThePrGod.
              We reserve the right to assign, replace, or remove influencers as
              necessary to meet project goals.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">6. Payments and Fees</h3>
            <h4 className="font-semibold mt-3 mb-2">A. Client Payments</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Clients pay the full campaign amount upfront to ThePrGod</li>
              <li>
                ThePrGod charges a{" "}
                <strong>20% management and administration fee</strong>
              </li>
              <li>The remaining 80% is allocated for influencer payouts</li>
            </ul>
            <h4 className="font-semibold mt-3 mb-2">B. Influencer Payments</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Influencers are paid after successful completion and approval of
                their assigned tasks
              </li>
              <li>
                For long-term campaigns exceeding 30 days, influencers may
                request partial payment
              </li>
              <li>
                Payments are typically released within 3-5 business days after
                approval
              </li>
            </ul>
            <p>
              ThePrGod reserves the right to hold payments for review in cases
              of non-compliance, dispute, or investigation.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              7. Long-Term Contracts and Milestone Payments
            </h3>
            <p className="font-semibold mt-3 mb-2">
              For campaigns that run for more than 30 days, influencers can
              request milestone-based payments.
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Partial payments reflect the percentage of verified work
                completed.
              </li>
              <li>
                Requests must be made through the platform’s payment request
                feature.
              </li>
              <li>
                ThePrGod reviews and verifies performance before releasing
                partial funds.
              </li>
            </ul>
            <p>
              Final payment is made once the full campaign obligations are
              completed and approved.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">8. Refunds</h3>
            <p className="font-semibold mt-3 mb-2">
              Clients may be eligible for refunds if:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                The campaign cannot be fulfilled by ThePrGod due to unforeseen
                reasons.
              </li>
              <li>
                Influencer performance fails to meet agreed standards and a
                replacement cannot be arranged.
              </li>
              <li>A double charge or technical error occurs.</li>
            </ul>
            <p>
              Refunds are processed back to the original payment method within
              5–10 business days, after review. Refunds are not available once a
              campaign is in progress or completed.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">9. Campaign Guidelines</h3>
            <p className="font-semibold mt-3 mb-2">Influencers agree to:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Complete tasks as instructed by ThePrGod.</li>
              <li>Use only approved content, captions, and hashtags.</li>
              <li>
                Follow Nigerian Advertising Regulations (ARCON) and disclose
                sponsorships using tags such as #ad, #sponsored, or
                #ThePrGodPartner.
              </li>
              <li>
                Maintain professionalism and avoid any conduct that could damage
                the client’s or ThePrGod’s reputation.
              </li>
            </ul>
            <p>
              Failure to comply may lead to payment forfeiture or account
              suspension.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">10. Prohibited Actions</h3>
            <p>Users must not:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Communicate or transact directly outside ThePrGod</li>
              <li>Engage in fraudulent, misleading, or unethical activities</li>
              <li>
                Post, share, or promote illegal or adult-restricted content
                without authorization
              </li>
              <li>Attempt to manipulate or falsify engagement data</li>
              <li>Use bots or third-party engagement boosters</li>
            </ul>
            <p className="mt-2 font-semibold">
              Violations may result in permanent suspension and legal action.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              11. Ownership and Intellectual Property
            </h3>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                All campaign materials, briefs, and deliverables remain the
                property of the Client after payment.
              </li>
              <li>
                ThePrGod retains the right to use completed campaigns for
                marketing, case studies, or promotional use, unless otherwise
                agreed.
              </li>
              <li>
                Influencers grant ThePrGod and Clients a non-exclusive,
                royalty-free license to use created content across agreed
                channels.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              12. Limitation of Liability
            </h3>
            <p>ThePrGod shall not be liable for:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Losses arising from influencer misconduct or client
                misrepresentation
              </li>
              <li>Indirect or consequential damages</li>
              <li>Payment delays caused by banking or gateway issues</li>
            </ul>
            <p className="mt-2 font-semibold">
              Our total liability for any claim shall not exceed the total
              amount paid for the specific campaign in question.{" "}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">13. Indemnification</h3>
            <p>
              You agree to indemnify and hold harmless ThePrGod, its directors,
              agents, and affiliates from any losses, claims, or expenses
              resulting from::
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Your use of the platform</li>
              <li>Violation of these Terms</li>
              <li>Breach of contract or misuse of campaign materials</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">14. Termination</h3>
            <p>We may suspend or terminate accounts if:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>You breach these Terms</li>
              <li>Fraudulent or harmful activity is detected</li>
              <li>Payments or deliverables are disputed in bad faith</li>
            </ul>
            <p className="mt-2 font-semibold">
              Termination does not cancel existing obligations — outstanding
              payments or refunds will still be processed fairly.{" "}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">15. Governing Law</h3>
            <p>
              These Terms are governed by and construed in accordance with the{" "}
              <strong>laws of the Federal Republic of Nigeria</strong>. Disputes
              shall be resolved through <strong>arbitration in Abuja</strong>.
            </p>
            <p>
              Disputes shall be resolved through arbitration in Abuja, in line
              with the Arbitration and Conciliation Act (Cap A18 LFN 2004).
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">16. Modifications</h3>
            <p>
              ThePrGod reserves the right to update or revise these Terms at any
              time. Updates will take effect once published on the website.
              Continued use of the platform signifies acceptance of revised
              Terms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">17. Contact Information</h3>
            <p>
              <strong>ThePrGod</strong>
              <br />
              Abuja, Nigeria
              <br />
              📧{" "}
              <a
                href="mailto:support@theprgod.com"
                className="text-blue-600 underline"
              >
                support@theprgod.com
              </a>
              <br />
              🌐{" "}
              <a
                href="https://theprgod.com"
                className="text-blue-600 underline"
              >
                https://theprgod.com
              </a>
            </p>
          </section>
        </div>
      ),
    },
    partnership: {
      title: "Partnership & Campaign Agreement",
      content: (
        <div className="space-y-3">
          <section>
            <h3 className="text-xl font-bold mb-3">1. Overview</h3>
            <p>
              This <strong>Partnership & Campaign Agreement</strong> is entered
              into between <strong>ThePrGod</strong>, acting as the campaign
              manager and intermediary, and the{" "}
              <strong>Influencer (&quot;Partner&quot;)</strong>.
            </p>
            <p className="mt-2">
              By accepting a campaign, the Influencer agrees to the terms
              outlined in this Agreement as part of their participation on
              ThePrGod platform.
            </p>
            <p>
              ThePrGod oversees every aspect of the campaign, from briefing to
              quality control and payment release, on behalf of the Client.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">2. Purpose of Agreement</h3>
            <p>The purpose of this Agreement is to outline:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                The obligations of the Influencer in executing promotional
                content;
              </li>
              <li>The responsibilities of ThePrGod as intermediary;</li>
              <li>
                The structure of payments, deliverables, and dispute handling;
              </li>
              <li>
                The rights, ownership, and confidentiality terms associated with
                the campaign.
              </li>
            </ul>
            <h4 className="font-semibold mt-3 mb-2">B. Approval</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                All drafts or posts must be submitted to ThePrGod for approval
                before going live
              </li>
              <li>ThePrGod reserves the right to request edits or rework</li>
              <li>
                Only after final approval may the influencer publish the content
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">3. Scope of Work</h3>
            <h4 className="font-semibold mt-3 mb-2">A. Deliverables</h4>
            <p>The Influencer agrees to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Create and publish content that aligns with campaign
                requirements
              </li>
              <li>
                Follow the exact posting schedule, hashtags, captions, and brand
                tone
              </li>
              <li>
                Maintain quality consistent with their normal audience
                engagement level
              </li>
            </ul>
            <h4 className="font-semibold mt-3 mb-2">B. Approval</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                All drafts or posts must be submitted to ThePrGod for approval
                before going live
              </li>
              <li>ThePrGod reserves the right to request edits or rework</li>
              <li>
                Only after final approval may the influencer publish the content
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              4. Compensation and Payment Terms
            </h3>
            <h4 className="font-semibold mt-3 mb-2">A. Payment Amount</h4>
            <p>
              The Influencer will receive the agreed amount, representing{" "}
              <strong>80% of the total campaign fee</strong>, after deducting
              ThePrGod&apos;s 20% management charge.
            </p>
            <h4 className="font-semibold mt-3 mb-2">B. Payment Conditions</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Payment is made after campaign completion and approval</li>
              <li>
                Funds are released within 3-5 business days after final
                acceptance
              </li>
              <li>
                For long-term campaigns (30+ days), milestone payments may be
                requested
              </li>
              <li>
                Requests for partial payment must be submitted to ThePrGod’s
                payment department with proof of completed tasks.
              </li>
            </ul>

            <h4 className="font-semibold mt-3 mb-2">C. Payment Method</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Direct bank transfer (Nigerian Naira), or</li>
              <li>Other supported payment channels on ThePrGod platform.</li>
            </ul>
            <p>
              Payments made outside ThePrGod are strictly prohibited and void.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              5. Ownership and Usage Rights
            </h3>
            <h4 className="font-semibold mt-3 mb-2">A. Client Ownership</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                All approved and paid-for content becomes the property of
                ThePrGod and the Client.
              </li>
              <li>
                Clients may reuse, repost, or repurpose content across social
                media, websites, or advertisements.
              </li>
            </ul>

            <h4 className="font-semibold mt-3 mb-2">B. Influencer Rights</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Influencers may showcase their completed campaign work in their
                portfolios or social channels for personal promotion, provided
                they include “#ThePrGodPartner” or similar acknowledgment.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">6. Confidentiality</h3>
            <h4 className="font-semibold mt-3 mb-2">
              The Influencer agrees not to:
            </h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Disclose client information, campaign details, or payment terms
                to any third party.
              </li>
              <li>Share campaign briefs or unpublished materials publicly.</li>
            </ul>
            <p>
              All campaign-related information remains confidential before,
              during, and after the campaign.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              7. Conduct and Compliance
            </h3>
            <p>Influencers must:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Adhere to{" "}
                <strong>Nigerian Advertising Regulation (ARCON)</strong>{" "}
                guidelines
              </li>
              <li>Avoid content that is offensive, discriminatory, or false</li>
              <li>Maintain professionalism in all communications</li>
              <li>
                Not contact the client directly — all correspondence must go
                through ThePrGod
              </li>
            </ul>
            <p className="mt-2 font-semibold">
              Violation may lead to termination and forfeiture of payments.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              7. Conduct and Compliance
            </h3>
            <h4 className="font-semibold mt-3 mb-2">Influencers must:</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Adhere to Nigerian Advertising Regulation (ARCON) guidelines,
                including ad disclosure.
              </li>
              <li>
                Avoid content that is offensive, discriminatory, or false.
              </li>
              <li>Maintain professionalism in all communications.</li>
              <li>
                Not contact the client directly — all correspondence must go
                through ThePrGod.
              </li>
            </ul>
            <p>
              Violation of conduct or communication policy may lead to
              termination of the influencer’s participation and forfeiture of
              payments.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              8. Non-Performance and Termination
            </h3>
            <h4 className="font-semibold mt-3 mb-2">
              ThePrGod may terminate this agreement if:
            </h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                The influencer fails to deliver agreed content by the deadline;
              </li>
              <li>The influencer breaches content or ethical guidelines;</li>
              <li>
                The influencer communicates directly with the client without
                authorization;
              </li>
              <li>Fraudulent or misleading actions are discovered.</li>
            </ul>
            <p>
              If terminated after partial delivery, ThePrGod may approve
              pro-rata payment for completed verified work only.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">9. Dispute Resolution</h3>
            <h4 className="font-semibold mt-3 mb-2">Any disputes regarding:</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Payment</li>
              <li>Quality of work</li>
              <li>Delivery timelines, or</li>
              <li>Misunderstanding of brief</li>
            </ul>
            <p>
              shall be handled by ThePrGod’s Internal Dispute Team. The decision
              of ThePrGod shall be final regarding payments held in escrow.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              10. Independent Contractor Relationship
            </h3>
            <h4 className="font-semibold mt-3 mb-2">
              The Influencer acknowledges that:
            </h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                They are an independent contractor, not an employee of ThePrGod.
              </li>
              <li>They are responsible for their own tax obligations.</li>
              <li>
                They cannot represent themselves as an employee, agent, or
                spokesperson of ThePrGod or its clients without written
                approval.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              11. Liability and Indemnification
            </h3>
            <h4 className="font-semibold mt-3 mb-2">
              The Influencer agrees to indemnify and hold harmless ThePrGod, its
              clients, and affiliates from any claims or losses arising from:
            </h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Breach of this Agreement</li>
              <li>Misuse of client content, or</li>
              <li>Violation of advertising or intellectual property laws.</li>
            </ul>
            <p>
              ThePrGod’s liability shall not exceed the total payment for the
              campaign in question.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">12. Governing Law</h3>
            <p>
              This Agreement shall be governed by the{" "}
              <strong>laws of the Federal Republic of Nigeria</strong>. Any
              disputes shall be resolved through{" "}
              <strong>arbitration in Abuja</strong> , in accordance with the{" "}
              <strong>
                Arbitration and Conciliation Act (Cap A18 LFN 2004)
              </strong>
              .
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">13. Agreement Acceptance</h3>
            <h4 className="font-semibold mt-3 mb-2">
              By accepting this campaign within the ThePrGod platform, the
              Influencer agrees that:
            </h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>They have read and understood this Agreement;</li>
              <li>They are bound by its terms;</li>
              <li>
                Their digital acceptance serves as a valid and enforceable
                signature under Nigerian contract law.
              </li>
            </ul>
          </section>
        </div>
      ),
    },
    client: {
      title: "Client Campaign Agreement",
      content: (
        <div className="space-y-3">
          <section>
            <h3 className="text-xl font-bold mb-3">1. Introduction</h3>
            <p>
              This <strong>Client Campaign Agreement (“Agreement”)</strong>is
              made between ThePrGod, a Nigerian-based influencer marketing
              management company, and the Client, who seeks to promote products,
              services, or events through ThePrGod’s verified influencer
              network. By signing or approving this Agreement (digitally or
              physically), the Client acknowledges and agrees to all terms
              outlined herein.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">2. Purpose of Agreement</h3>
            <p>ThePrGod agrees to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Design, manage, and execute influencer marketing campaigns on
                behalf of the Client.
              </li>
              <li>
                Handle all influencer selection, communication, negotiation, and
                supervision.
              </li>
              <li>
                Process and disburse payments to influencers only upon verified
                completion of assigned deliverables.
              </li>
            </ul>
            <p>
              This Agreement ensures transparent, professional, and legally
              compliant influencer promotions under the full management of
              ThePrGod.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">3. Service Scope</h3>
            <h4 className="font-semibold mt-3 mb-2">ThePrGod will:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Identify and onboard suitable influencers based on the Client’s
                target audience, campaign goals, and budget.
              </li>
              <li>
                Develop campaign briefs, posting guidelines, and approval
                workflows.
              </li>
              <li>
                Manage the full campaign lifecycle — from kickoff to content
                delivery and reporting.
              </li>
              <li>
                Provide the Client with periodic progress updates and
                post-campaign reports.
              </li>
            </ul>
            <h4 className="font-semibold mt-3 mb-2">The Client will:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Provide accurate information about the product, service, or
                event to be promoted.
              </li>
              <li>
                Review and approve campaign briefs and budget before launch.
              </li>
              <li>Fund the campaign in full prior to execution.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">4. Payment Terms</h3>
            <h4 className="font-semibold mt-3 mb-2">A. Campaign Funding</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                The Client must pay the total campaign cost upfront to ThePrGod
                before campaign initiation.
              </li>
              <li>
                The total includes:
                <ul>
                  <li>Influencer payout(s)</li>
                  <li>
                    20% management and service fee, covering supervision,
                    coordination, dispute resolution, and reporting.
                  </li>
                </ul>
              </li>
            </ul>
            <h4 className="font-semibold mt-3 mb-2">B. Payment Method</h4>
            <p>
              All payments must be made through ThePrGod’s approved payment
              channels or bank accounts. Payments made directly to influencers
              or third parties are strictly prohibited and void under this
              Agreement.
            </p>

            <h4 className="font-semibold mt-3 mb-2">C. Refunds</h4>
            <p>Refunds are only issued under the following conditions:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Campaign cannot be executed due to influencer unavailability or
                legal restrictions.
              </li>
              <li>Duplicate or erroneous payment.</li>
              <li>Campaign canceled before influencer engagement begins.</li>
            </ul>
            <p>
              Refunds will be processed within 5–10 business days after
              approval, minus any non-recoverable transaction costs.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              5. Deliverables and Performance
            </h3>
            <h4 className="font-semibold mt-3 mb-2">
              ThePrGod guarantees that:
            </h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Influencers will deliver content consistent with the approved
                brief.
              </li>
              <li>
                All posts will comply with Nigerian Advertising Regulatory
                Council (ARCON) guidelines.
              </li>
              <li>
                Sponsorship disclosures such as “#ad” or “#ThePrGodPartner” will
                be included where required.
              </li>
            </ul>
            <h4 className="font-semibold mt-3 mb-2">
              The Client acknowledges that:
            </h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Influencer content is subject to approval cycles and may vary in
                creative style.
              </li>
              <li>
                Engagement metrics (likes, comments, reach) cannot be guaranteed
                but are optimized through influencer selection.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              6. Communication Protocol
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                The Client shall{" "}
                <strong>not contact influencers directly</strong>.
              </li>
              <li>
                All campaign communication, content approvals, and performance
                feedback must occur through ThePrGod.
              </li>
              <li>
                ThePrGod’s campaign managers will serve as the sole point of
                contact for updates and support.
              </li>
            </ul>
            <p>
              This ensures brand consistency, confidentiality, and protection
              for all parties.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              7. Confidentiality and Data Use
            </h3>
            <h4>Both parties agree to maintain confidentiality over:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Campaign strategies and briefs,</li>
              <li>Pricing, payments, and influencer identities,</li>
              <li>Client data and marketing insights.</li>
            </ul>
            <p>
              ThePrGod may use anonymized campaign data and outcomes for
              marketing case studies or internal performance analysis, with no
              sensitive client details disclosed.his ensures brand consistency,
              confidentiality, and protection for all parties.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              8. Content Rights and Ownership
            </h3>
            <h4>Upon full payment:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                The Client receives full ownership and commercial rights to all
                influencer content produced under the campaign.
              </li>
              <li>
                ThePrGod retains the right to feature campaign materials in its
                marketing portfolio or success showcases (non-exclusive use).
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">9. Dispute Resolution</h3>
            <h4>In the event of a dispute:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                The Client must notify ThePrGod in writing within 7 days of the
                issue.
              </li>
              <li>
                ThePrGod will review and mediate the situation with supporting
                evidence.
              </li>
              <li>
                If unresolved, disputes shall be referred to{" "}
                <strong>arbitration in Abuja</strong>, in accordance with the{" "}
                <strong>
                  Arbitration and Conciliation Act (Cap A18 LFN 2004).
                </strong>
              </li>
            </ul>
            <p>
              The decision of the arbitration panel shall be final and binding.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              10. Limitation of Liability
            </h3>
            <h4>ThePrGod will not be liable for:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Indirect, incidental, or consequential losses.</li>
              <li>
                Client revenue or reputation losses resulting from influencer
                actions beyond ThePrGod’s control.
              </li>
              <li>
                Technical or platform-related issues (e.g., social media
                algorithm changes, downtime).
              </li>
            </ul>
            <p>
              Total liability in any claim shall not exceed the total fees paid
              for the campaign in question.{" "}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">11. Termination</h3>
            <h4>This Agreement may be terminated by:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Either party, in writing, before influencer assignment (full
                refund minus transaction fees).
              </li>
              <li>
                ThePrGod, if the campaign involves illegal, offensive, or
                unethical content.
              </li>
              <li>
                The Client, at any time before campaign launch, subject to
                administrative deductions.
              </li>
            </ul>
            <p>
              Once a campaign is live, termination requests will be reviewed on
              a case-by-case basis and refunds will depend on influencer work
              completed.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">12. Governing Law</h3>
            <p>
              This Agreement shall be governed by and construed in accordance
              with the laws of the Federal Republic of Nigeria. All disputes
              shall be resolved through arbitration in Abuja under Nigerian
              legal provisions.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">13. Acceptance</h3>
            <h4>
              By signing below or approving this Agreement digitally, the Client
              confirms that they:
            </h4>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Have read, understood, and agreed to this Agreement.</li>
              <li>
                Authorize ThePrGod to manage all influencer communications and
                payments.
              </li>
              <li>Acknowledge the 20% service and management fee.</li>
            </ul>
          </section>
        </div>
      ),
    },
    service: {
      title: "Service Level & Performance Policy",
      content: (
        <div className="space-y-3">
          <section>
            <h3 className="text-xl font-bold mb-3">1. Introduction</h3>
            <p>
              At <strong>ThePrGod</strong>, we are committed to delivering
              high-quality influencer marketing campaigns that meet our
              clients&apos; objectives while ensuring fairness and
              professionalism for our influencers. This Service Level &
              Performance Policy outlines the standards we follow to maintain
              trust, transparency, and timely delivery across all campaigns
              managed by our team.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              2. Our Service Commitment
            </h3>
            <p>We guarantee that every campaign run through ThePrGod is:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Professionally managed end-to-end by our internal team</li>
              <li>
                Executed by verified influencers who meet strict eligibility
                checks
              </li>
              <li>
                Supervised through content approval, posting verification, and
                engagement tracking
              </li>
              <li>
                Delivered within agreed timelines and reviewed before payment
                release
              </li>
            </ul>
            <p>
              We stand between the client and influencer to ensure fairness,
              quality, and consistency.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              3. Campaign Management Standards
            </h3>
            <p>ThePrGod will:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Prepare detailed campaign briefs that outline posting formats,
                platforms, and objectives.
              </li>
              <li>
                Assign influencers based on relevance, audience quality, and
                brand fit.
              </li>
              <li>
                Oversee all influencer communications and creative approvals.
              </li>
              <li>
                Provide clients with updates during each phase (setup, posting,
                completion).
              </li>
              <li>
                Verify all deliverables before marking the campaign as
                completed.
              </li>
            </ul>
            <p>
              All campaigns must pass our internal quality assurance checks
              before final reporting and payment.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              4. Influencer Performance Standards
            </h3>
            <h4 className="font-semibold mt-3 mb-2">A. Timeliness</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Deliver assigned tasks within the deadlines set in the campaign
                brief
              </li>
              <li>
                Notify ThePrGod in advance of any potential delay (at least 24
                hours before due date)
              </li>
            </ul>
            <h4 className="font-semibold mt-3 mb-2">B. Content Quality</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Ensure all posts meet brand tone, image quality, and caption
                accuracy requirements
              </li>
              <li>Use only approved hashtags, tags, and call-to-actions</li>
              <li>
                Maintain authenticity — no AI-generated, fake engagement, or
                misleading content
              </li>
            </ul>
            <h4 className="font-semibold mt-3 mb-2">C. Compliance</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Follow Nigerian advertising and disclosure laws (ARCON and NCC
                guidelines)
              </li>
              <li>
                Include sponsorship tags like #ad, #sponsored, or
                #ThePrGodPartner
              </li>
              <li>
                Avoid any content that is illegal, explicit, defamatory, or
                politically inflammatory
              </li>
            </ul>

            <h4 className="font-semibold mt-3 mb-2">D. Professionalism</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Communicate respectfully with ThePrGod representatives.</li>
              <li>
                Avoid public disagreements or unapproved statements about
                clients or ThePrGod.
              </li>
            </ul>

            <h4 className="font-semibold mt-3 mb-2">
              Failure to comply with these standards may lead to:
            </h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Suspension from active campaigns,</li>
              <li>Payment forfeiture, or</li>
              <li>Permanent removal from the influencer network.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              5. Client Service Standards
            </h3>
            <p>ThePrGod ensures all clients receive:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Transparent campaign pricing and reporting.</li>
              <li>Active supervision of influencer activities.</li>
              <li>100% control of brand safety and reputation.</li>
              <li>Access to post-campaign analytics and proof of posting.</li>
              <li>
                Resolution of issues within the specified service window (see
                below).
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              6. Response and Resolution Timeframes
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Service Request Type
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Response Time
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Resolution Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      General inquiries
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Within 24 hours
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Within 2 business days
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Campaign setup
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Within 2 business days
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Within 5 business days
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Performance issue
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Within 12 hours
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Within 3 business days
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Payment question
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Within 24 hours
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Within 5 business days
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Refund/dispute
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Within 2 business days
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Within 10 business days
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              7. Payment and Performance Reviews
            </h3>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Influencers are paid only after ThePrGod verifies content
                completion and quality.
              </li>
              <li>
                Clients may request mid-campaign updates or post-campaign
                summaries.
              </li>
              <li>
                For long-term (30+ day) campaigns, influencers can request
                partial milestone payments proportional to verified progress.
              </li>
              <li>
                ThePrGod may pause payments during investigations or dispute
                resolution, ensuring fairness to all parties.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              8. Quality Control and Accountability
            </h3>
            <p>ThePrGod maintains strict performance audits including:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Content authenticity checks</li>
              <li>Engagement pattern reviews</li>
              <li>Client satisfaction ratings</li>
              <li>Timeliness and professionalism scoring</li>
              <li>
                Resolution of issues within the specified service window (see
                below).
              </li>
            </ul>

            <p>
              Influencers who consistently meet or exceed expectations may
              receive:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Priority placement in premium campaigns</li>
              <li>Higher payout rates</li>
              <li>“Verified Partner” badges on their profiles</li>
            </ul>
            <p>
              Conversely, underperformance or non-compliance may lead to lower
              visibility or removal from the network.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              9. Dispute Handling and Escalation
            </h3>
            <p>Disputes are handled fairly and confidentially:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                All complaints must be submitted in writing to
                support@theprgod.com.
              </li>
              <li>ThePrGod will acknowledge receipt within 24 hours.</li>
              <li>
                Our Dispute Team investigates and issues a decision within 10
                business days.
              </li>
              <li>
                If a resolution cannot be reached, the matter may proceed to
                arbitration in Abuja, under Nigerian law.
              </li>
            </ul>
            <p>ThePrGod’s decision regarding funds held in escrow is final.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">10. Service Limitations</h3>
            <p>
              While ThePrGod guarantees professionalism and oversight, the
              following limitations apply:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Engagement metrics (likes, comments, views) are influenced by
                external algorithms and cannot be guaranteed.
              </li>
              <li>
                Campaign outcomes depend on audience behavior, timing, and
                market conditions.
              </li>
              <li>
                Influencer availability or platform restrictions may cause minor
                delays.
              </li>
            </ul>
            <p>
              We are committed to transparency and proactive communication
              whenever such issues arise.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">11. Policy Updates</h3>
            <p>
              ThePrGod may update this Service Level & Performance Policy from
              time to time to reflect improvements or regulatory changes. All
              updates will be published on https://theprgod.com with a new
              effective date.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">12. Contact Information</h3>
            <p>
              <strong>ThePrGod</strong>
              <br />
              Abuja, Nigeria
              <br />
              📧{" "}
              <a
                href="mailto:support@theprgod.com"
                className="text-blue-600 underline"
              >
                support@theprgod.com
              </a>
              <br />
              🌐{" "}
              <a
                href="https://theprgod.com"
                className="text-blue-600 underline"
              >
                https://theprgod.com
              </a>
            </p>
          </section>
        </div>
      ),
    },
    brand: {
      title: "Brand Safety & Advertising Compliance",
      content: (
        <div className="space-y-3">
          <section>
            <h3 className="text-xl font-bold mb-3">1. Introduction</h3>
            <p>
              At <strong>ThePrGod</strong>, we prioritize{" "}
              <strong>brand safety</strong>,{" "}
              <strong>ethical advertising</strong>, and{" "}
              <strong>regulatory compliance</strong> in every campaign we
              manage.
            </p>
            <p className="mt-2">
              This policy defines the content standards and conduct rules for
              all influencers, clients, and collaborators on our platform. Our
              goal is to maintain a respectful, truthful, and responsible online
              environment that protects the reputation of all parties.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">2. Scope</h3>
            <p>This policy applies to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                All influencers, content creators, and ambassadors working under
                ThePrGod campaigns.
              </li>
              <li>
                All clients, brands, and businesses using ThePrGod’s platform or
                services.
              </li>
              <li>
                All forms of content created, published, or promoted under
                ThePrGod management (including posts, videos, reels, live
                sessions, and sponsored mentions).
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              3. Core Principles of Brand Safety
            </h3>
            <h4 className="font-semibold mt-3 mb-2">A. Truthfulness</h4>
            <p>
              All promotions must represent products and services accurately.
              False claims, exaggerated results, or misleading endorsements are
              strictly prohibited.
            </p>
            <h4 className="font-semibold mt-3 mb-2">B. Transparency</h4>
            <p>
              All paid promotions must include clear disclosure tags such as:
              #ad, #sponsored, #ThePrGodPartner
            </p>
            <h4 className="font-semibold mt-3 mb-2">
              C. Respect and Integrity
            </h4>
            <p>
              Content must be respectful toward all individuals, communities,
              and organizations. We do not allow hate speech, harassment,
              discrimination, or exploitation in any form.
            </p>
            <h4 className="font-semibold mt-3 mb-2">
              D. Legal and Ethical Compliance
            </h4>
            <p>All campaigns must comply with:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Advertising Regulatory Council of Nigeria (ARCON) Act 2022
              </li>
              <li>Nigerian Data Protection Act (NDPA) 2023</li>
              <li>Cybercrime (Prohibition, Prevention, etc.) Act 2015</li>
              <li>Platform-specific policies (Meta, X, TikTok, YouTube)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">4. Prohibited Content</h3>
            <p>
              Influencers and clients are strictly forbidden from promoting
              content that involves:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <strong>Illegal activities:</strong> Drugs, weapons, human
                trafficking, fraud
              </li>
              <li>
                <strong>Hate or discrimination:</strong> Racism, sexism,
                homophobia
              </li>
              <li>
                <strong>Violence or abuse:</strong> Physical harm, threats,
                explicit violence
              </li>
              <li>
                <strong>Sexually explicit content:</strong> Pornography, adult
                services, NSFW material
              </li>
              <li>
                <strong>Misinformation:</strong> False claims, unverified news,
                conspiracy theories
              </li>
              <li>
                <strong>Health or financial deception:</strong> &quot;Miracle
                cures,&quot; &quot;get-rich-quick&quot; schemes
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              5. Content Review Process
            </h3>
            <p>Every campaign goes through three review stages:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <strong>Pre-Approval:</strong>
                ThePrGod reviews client briefs to ensure legal and ethical
                compliance..
              </li>
              <li>
                <strong>Content Submission:</strong>
                Influencers submit drafts for internal approval before posting.
              </li>
              <li>
                <strong>Post-Verification:</strong>
                Published content is checked to ensure compliance with brief,
                platform policies, and brand tone.
              </li>
            </ul>
            <p>
              Violations discovered at any stage may lead to content removal,
              payment withholding, or permanent suspension.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              6. Influencer Responsibilities
            </h3>
            <p>All influencers working through ThePrGod must:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Disclose paid collaborations transparently.</li>
              <li>
                Avoid engaging in online controversies that may harm client
                reputation.
              </li>
              <li>
                Follow ThePrGod’s creative briefs and tone-of-voice
                instructions.
              </li>
              <li>
                Immediately remove or edit content upon ThePrGod’s request if
                found non-compliant.
              </li>
            </ul>
            <p>
              Failure to follow these guidelines may result in suspension from
              future campaigns.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              7. Client Responsibilities
            </h3>
            <p>Clients and advertisers using ThePrGod must:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Provide truthful product information and claims supported by
                evidence.
              </li>
              <li>
                Avoid asking influencers to post misleading, deceptive, or
                illegal messages.
              </li>
              <li>
                Allow ThePrGod to oversee all influencer communication and
                approvals.
              </li>
              <li>
                Cooperate in resolving content or compliance concerns promptly.
              </li>
            </ul>
            <p>
              Any client who knowingly submits false information or violates
              Nigerian advertising laws may be barred from future use of the
              platform.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              8. Monitoring and Enforcement
            </h3>
            <p>ThePrGod enforces compliance through:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Active monitoring of influencer posts and engagement data.
              </li>
              <li>
                Automated keyword flagging for sensitive or restricted content.
              </li>
              <li>Manual content review by our compliance team.</li>
            </ul>

            <p>Breaches of this policy may lead to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Immediate campaign suspension.</li>
              <li>Account termination</li>
              <li>Payment withholding or refund to affected parties</li>
              <li>
                Reporting to appropriate Nigerian authorities where required by
                law
              </li>
            </ul>
            <p>
              Any client who knowingly submits false information or violates
              Nigerian advertising laws may be barred from future use of the
              platform.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">9. Reporting Violations</h3>
            <p>
              Users or the public may report any suspected violations by
              emailing:
            </p>
            <p className="mt-2">
              📧{" "}
              <a
                href="mailto:support@theprgod.com"
                className="text-blue-600 underline"
              >
                support@theprgod.com
              </a>{" "}
              with evidence or post links.
            </p>
            <p className="mt-2">
              ThePrGod reviews all reports confidentially and takes appropriate
              action within 5-10 business days.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">10. Policy Updates</h3>
            <p>
              ThePrGod may update this policy periodically to reflect new
              regulations or industry standards. All changes will be posted on
              https://theprgod.com with a revised effective date.{" "}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">11. Contact Information</h3>
            <p>
              <strong>ThePrGod</strong>
              <br />
              Abuja, Nigeria
              <br />
              📧{" "}
              <a
                href="mailto:support@theprgod.com"
                className="text-blue-600 underline"
              >
                support@theprgod.com
              </a>
              <br />
              🌐{" "}
              <a
                href="https://theprgod.com"
                className="text-blue-600 underline"
              >
                https://theprgod.com
              </a>
            </p>
          </section>
        </div>
      ),
    },
    conduct: {
      title: "Platform Code of Conduct",
      content: (
        <div className="space-y-3">
          <section>
            <h3 className="text-xl font-bold mb-3">1. Introduction</h3>
            <p>
              At <strong>ThePrGod</strong>, we believe that professionalism,
              respect, and transparency are the foundation of meaningful
              collaborations between brands and influencers.
            </p>
            <p className="mt-2">
              This <strong>Platform Code of Conduct</strong> outlines the
              behavioral and ethical expectations for everyone using our
              platform — including clients, influencers, and internal partners.
            </p>
            <p className="mt-2">
              Our goal is to create a safe, fair, and inspiring environment
              where creativity thrives and every campaign reflects integrity.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">2. Core Values</h3>
            <p>All users of ThePrGod agree to uphold these core values:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <strong>Professionalism:</strong> Treat every interaction with
                courtesy and respect
              </li>
              <li>
                <strong>Integrity:</strong> Be honest about intentions,
                deliverables, and results
              </li>
              <li>
                <strong>Accountability:</strong> Take responsibility for your
                words, work, and commitments
              </li>
              <li>
                <strong>Respect:</strong> Value the people behind the platforms
                — no harassment, insults, or threats
              </li>
              <li>
                <strong>Compliance:</strong> Follow all platform rules,
                advertising laws, and content standards
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              3. Expectations for Influencers
            </h3>
            <p>Influencers on ThePrGod are expected to:</p>
            <div className="space-y-3 mt-3">
              <div>
                <p className="font-semibold">1. Deliver on Commitments</p>
                <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                  <li>
                    Complete all assigned campaigns on time and as briefed
                  </li>
                  <li>Notify ThePrGod early if delays or issues arise</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">
                  2. Maintain Professional Conduct
                </p>
                <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                  <li>Communicate politely with ThePrGod team members</li>
                  <li>
                    Refrain from aggressive, abusive, or unprofessional language
                    in all correspondence
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">3. Respect Confidentiality</p>
                <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                  <li>
                    Do not disclose client information or campaign details
                    publicly
                  </li>
                  <li>
                    Never share screenshots, rates, or private messages without
                    permission
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">4. Avoid Direct Client Contact</p>
                <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                  <li>
                    All campaign communication must go through ThePrGod only
                  </li>
                  <li>
                    Direct outreach to clients for deals, payments, or
                    negotiations is strictly prohibited
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">5. Content Integrity</p>
                <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                  <li>Follow the brief exactly as provided</li>
                  <li>
                    Avoid using fake engagement tools, AI impersonation, or any
                    misleading tactic
                  </li>
                  <li>
                    Follow all brand safety, advertising, and ARCON disclosure
                    rules
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">6. Reputation Management</p>
                <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                  <li>
                    Do not engage in online arguments, hate speech, or actions
                    that may harm ThePrGod or its clients&apos; reputation
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              4. Expectations for Clients
            </h3>
            <p>Clients using ThePrGod agree to:</p>
            <div className="space-y-3 mt-3">
              <div>
                <p className="font-semibold">1. Provide Accurate Information</p>
                <ul className="list-disc ml-6 mt-1 text-sm">
                  <li>
                    Ensure all campaign details, brand claims, and product
                    descriptions are truthful
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">
                  2. Respect the Chain of Communication
                </p>
                <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                  <li>Never contact influencers directly</li>
                  <li>
                    All coordination must go through ThePrGod campaign managers
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">3. Maintain Professionalism</p>
                <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                  <li>
                    Treat all influencers and ThePrGod staff with respect and
                    courtesy
                  </li>
                  <li>Avoid discriminatory or offensive remarks</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">4. Payment and Trust</p>
                <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                  <li>Pay campaign fees in full before activation</li>
                  <li>
                    Avoid side deals or direct payments to influencers — they
                    violate this Code
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">5. Ethical Standards</p>
                <ul className="list-disc ml-6 mt-1 text-sm space-y-1">
                  <li>
                    Do not request or approve content that is misleading,
                    offensive, or illegal
                  </li>
                  <li>
                    Follow all Nigerian and international advertising
                    regulations
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">5. Prohibited Behaviors</h3>
            <p>
              The following actions are <strong>strictly prohibited</strong> on
              ThePrGod:
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      Category
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      Examples
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Harassment
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Bullying, abusive messages, or intimidation of users or
                      staff.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Discrimination
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Racist, sexist, or hateful speech of any kind.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Fraud
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Fake jobs, false engagements, or payment manipulation.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Breach of Confidentiality
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Leaking campaign info or private messages.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Direct Transactions
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Bypassing ThePrGod to pay or receive money outside the
                      platform.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Defamation
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Posting false or damaging statements about ThePrGod,
                      clients, or influencers.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-semibold">
                      Illegal Content
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      Promoting drugs, weapons, scams, or prohibited materials.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 font-semibold">
              Violations may result in account suspension, removal, or legal
              action under Nigerian law.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              6. Communication Etiquette
            </h3>
            <p>
              We believe in clear, respectful, and solution-oriented
              communication.
            </p>
            <p className="mt-2">Users must:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Use professional language at all times</li>
              <li>Avoid caps lock, insults, or threats</li>
              <li>
                Refrain from demanding immediate replies outside working hours
              </li>
            </ul>
            <p className="mt-2 text-sm text-gray-600">
              Our team responds to all inquiries within 24–48 hours during
              business days.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">7. Reporting Misconduct</h3>
            <p>
              If you encounter inappropriate behavior or unethical practices on
              the platform:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Email us at{" "}
                <a
                  href="mailto:support@theprgod.com"
                  className="text-blue-600 underline"
                >
                  support@theprgod.com
                </a>
              </li>
              <li>
                Provide campaign details, screenshots, or supporting evidence
              </li>
              <li>
                Reports will be reviewed confidentially, and action will be
                taken within 5–10 business days
              </li>
            </ul>
            <p className="mt-2 text-sm text-gray-600">
              All reports are treated seriously and without retaliation.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">8. Disciplinary Actions</h3>
            <p>Depending on the severity of the violation, ThePrGod may:</p>
            <ol className="list-decimal ml-6 mt-2 space-y-1">
              <li>Issue a formal warning</li>
              <li>Suspend the user&apos;s account or ongoing campaigns</li>
              <li>Withhold or reverse payments</li>
              <li>Permanently terminate platform access</li>
              <li>
                Pursue legal action under Nigerian law if fraud or defamation is
                involved
              </li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">
              9. Recognition and Rewards
            </h3>
            <p>
              To encourage positive conduct, ThePrGod maintains a{" "}
              <strong>Performance Recognition System</strong>:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                Influencers with strong professionalism receive higher
                visibility and premium campaign access
              </li>
              <li>
                Clients with consistent ethical practices receive &quot;Verified
                Partner&quot; status
              </li>
            </ul>
            <p className="mt-2 font-semibold">
              Respect earns reputation — and more opportunities.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">10. Governing Law</h3>
            <p>
              This Code of Conduct is governed by the{" "}
              <strong>laws of the Federal Republic of Nigeria</strong>. Any
              disputes shall be resolved through{" "}
              <strong>arbitration in Abuja</strong>, following the Arbitration
              and Conciliation Act (Cap A18 LFN 2004).
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">11. Updates</h3>
            <p>
              ThePrGod may revise this Code of Conduct periodically to reflect
              best practices and new policies. Updated versions will be
              published at{" "}
              <a
                href="https://theprgod.com"
                className="text-blue-600 underline"
              >
                https://theprgod.com
              </a>{" "}
              with a revised effective date.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-3">12. Contact</h3>
            <p>
              <strong>ThePrGod</strong>
              <br />
              Abuja, Nigeria
              <br />
              📧{" "}
              <a
                href="mailto:support@theprgod.com"
                className="text-blue-600 underline"
              >
                support@theprgod.com
              </a>
              <br />
              🌐{" "}
              <a
                href="https://theprgod.com"
                className="text-blue-600 underline"
              >
                https://theprgod.com
              </a>
            </p>
          </section>
        </div>
      ),
    },
  };

  const docCategories = [
    { id: "privacy", label: "Privacy Policy", icon: "/icons/lock.png" },
    { id: "terms", label: "Terms of Service", icon: "/icons/write.png" },
    {
      id: "partnership",
      label: "Partnership Agreement",
      icon: "/icons/agree.png",
    },
    { id: "service", label: "Service Level Policy", icon: "/icons/power.png" },
    { id: "brand", label: "Brand Safety", icon: "/icons/shield.png" },
    { id: "conduct", label: "Code of Conduct", icon: "/icons/star.png" },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        // Modal container: no change here
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] relative shadow-2xl border border-gray-100 flex overflow-hidden"
        variants={modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button: remains the same */}
        {/* <div className="absolute top-0 right-0 z-10 p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close Legal Documents"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div> */}

        <div className="hidden md:flex flex-col md:w-full md:max-w-xs bg-gray-50 border-r border-gray-200 p-6">
          <h2 className="text-2xl flex items-center gap-4 font-extrabold text-gray-900 mb-6">
            Legal Documents{" "}
            <Image src="/icons/doc.png" width={30} height={30} alt="icon" />
          </h2>
          <nav className="space-y-2 overflow-y-auto pr-2">
            {docCategories.map((doc) => (
              <motion.button
                key={doc.id}
                onClick={() => setSelectedDoc(doc.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
                  selectedDoc === doc.id
                    ? "bg-yellow-500 text-white shadow-md hover:bg-yellow-700"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image src={doc.icon} width={20} height={20} alt="icon" />
                <span>{doc.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Mobile-Only Navigation (Dropdown) */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 md:hidden">
            <label htmlFor="mobile-doc-select" className="sr-only">
              Select Document
            </label>
            <select
              id="mobile-doc-select"
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="block w-full rounded-lg border-gray-300 py-2.5 pl-3 pr-10 text-base focus:border-yellow-500 focus:ring-yellow-500"
            >
              {docCategories.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Main Document Content */}
          <div className="flex-1 overflow-y-auto p-8 lg:p-12">
            <motion.div
              key={selectedDoc}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <h3 className="text-3xl font-extrabold mb-6 text-gray-900 border-b pb-2">
                {documents[selectedDoc as keyof typeof documents].title}
              </h3>
              <div className="text-gray-700 text-base leading-7 space-y-4">
                {documents[selectedDoc as keyof typeof documents].content}
              </div>
            </motion.div>
          </div>

          {/* --- Footer --- (remains the same) */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 text-center text-xs text-gray-500">
            Last updated: October 18, 2025 • ThePrGod © 2025
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LegalDocumentsModal;
