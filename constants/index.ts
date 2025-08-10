export const navLinks = [
  {
    name: "For Promotion",
    subLinks: [
      { name: "Promote a Product or Service", href: "#promote-product" },
      { name: "Promote an Individual", href: "#promote-individual" },
      { name: "Promote a Brand", href: "#promote-brand" },
      { name: "Promote an Event", href: "#promote-event" },
    ],
  },
  {
    name: "For Influencers",
    subLinks: [{ name: "Join as an Influencer", href: "#join-influencer" }],
  },
  {
    name: "How It Works?",
    subLinks: [
      { name: "Overview: Matching Brands & Influencers", href: "#overview" },
      { name: "The Process", href: "#process" },
      { name: "Our Values & Mission", href: "#values-mission" },
      { name: "Contact Us", href: "#contact" },
    ],
  },
  { name: "Why Us?", href: "#why-us" },
];

export const features = [
  {
    title: "Smart Matching",
    description:
      "AI-driven tools match the right influencers with the right brands for higher ROI.",
    icon: "/icons/robot.png",
  },
  {
    title: "Seamless Collaboration",
    description:
      "Built-in messaging, contracts, and feedback loops streamline every step.",
    icon: "/icons/link.png",
  },
  {
    title: "Secure Payments",
    description:
      "Guaranteed, on-time payouts with built-in escrow protection for peace of mind.",
    icon: "/icons/lock.png",
  },
  {
    title: "Real-Time Analytics",
    description:
      "Track performance, reach, engagement, and more with beautiful, actionable reports.",
    icon: "/icons/chart.png",
  },
  {
    title: "End-to-End Campaigns",
    description:
      "From planning to execution, manage your entire campaign in one place.",
    icon: "/icons/parcel.png",
  },
  {
    title: "Global Reach",
    description:
      "Connect with creators and audiences from every corner of the globe.",
    icon: "/icons/globe.png",
  },
];

interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  time: string;
}

export const allSteps: Record<"influencer" | "brand" | "campaign", Step[]> = {
  campaign: [
    {
      id: 1,
      title: "Select Your Role",
      description:
        "Start by choosing whether you're an influencer or a brand to tailor the experience.",
      icon: "/icons/compass.png",
      color: "from-gray-500 to-gray-700",
      bgColor: "bg-gray-100",
      time: "1 min",
    },
    {
      id: 2,
      title: "Discover the Platform",
      description:
        "Explore how influencers and brands collaborate to build successful campaigns.",
      icon: "/icons/book.png",
      color: "from-blue-400 to-purple-400",
      bgColor: "bg-blue-50",
      time: "3 mins",
    },
    {
      id: 3,
      title: "Sign Up or Log In",
      description:
        "Create your account and personalize your journey with essential info.",
      icon: "/icons/write.png",
      color: "from-green-400 to-teal-500",
      bgColor: "bg-green-50",
      time: "5 mins",
    },
    {
      id: 4,
      title: "Access the Dashboard",
      description:
        "Navigate your dashboard tailored to your role to manage campaigns and insights.",
      icon: "/icons/chart.png",
      color: "from-yellow-400 to-orange-400",
      bgColor: "bg-yellow-50",
      time: "2 mins",
    },
    {
      id: 5,
      title: "Launch or Join a Campaign",
      description:
        "Whether you're launching a campaign or joining one, everything you need is right here.",
      icon: "/icons/rocket.png",
      color: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-50",
      time: "Ongoing",
    },
  ],
  influencer: [
    {
      id: 1,
      title: "Create Your Profile",
      description:
        "Sign up and build your influencer profile. Highlight your niche, audience, and content style.",
      icon: "/icons/user.png",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      time: "2 mins",
    },
    {
      id: 2,
      title: "Match with Brands",
      description:
        "Browse brand campaigns that align with your profile using AI-powered recommendations.",
      icon: "/icons/target.png",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      time: "5 mins",
    },
    {
      id: 3,
      title: "Apply and Collaborate",
      description:
        "Send proposals, discuss ideas, and collaborate with brands directly on our platform.",
      icon: "/icons/write.png",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      time: "10 mins",
    },
    {
      id: 4,
      title: "Publish and Share",
      description:
        "Create and publish content. Use our tools to streamline feedback and delivery.",
      icon: "/icons/color.png",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
      time: "3-7 days",
    },
    {
      id: 5,
      title: "Get Paid",
      description:
        "Receive timely, secure payments and track your performance and growth.",
      icon: "/icons/money.png",
      color: "from-teal-500 to-cyan-600",
      bgColor: "bg-teal-50",
      time: "Ongoing",
    },
  ],
  brand: [
    {
      id: 1,
      title: "Create a Campaign",
      description:
        "Outline your goals, target audience, and deliverables for your marketing campaign.",
      icon: "/icons/campaign.png",
      color: "from-blue-600 to-indigo-700",
      bgColor: "bg-blue-50",
      time: "3 mins",
    },
    {
      id: 2,
      title: "Browse Influencers",
      description:
        "Get matched with relevant influencers who align with your brand values.",
      icon: "/icons/search.png",
      color: "from-pink-500 to-red-600",
      bgColor: "bg-pink-50",
      time: "5 mins",
    },
    {
      id: 3,
      title: "Send Offers",
      description:
        "Send collaboration proposals and negotiate terms directly from your dashboard.",
      icon: "/icons/sendmail.png",
      color: "from-green-500 to-lime-600",
      bgColor: "bg-green-50",
      time: "10 mins",
    },
    {
      id: 4,
      title: "Review and Approve",
      description:
        "Collaborate with creators and approve their content before it goes live.",
      icon: "/icons/checkmark.png",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      time: "2-4 days",
    },
    {
      id: 5,
      title: "Measure Impact",
      description:
        "Track performance metrics, campaign success, and influencer ROI in one place.",
      icon: "/icons/chart.png",
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-indigo-50",
      time: "Ongoing",
    },
  ],
};
