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

export const allSteps: Record<"influencer" | "advertiser", Step[]> = {
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
        "Review brand campaigns that align with your profile.",
      icon: "/icons/target.png",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      time: "5 mins",
    },
    {
      id: 3,
      title: "Accept and Collaborate",
      description:
        "Discuss ideas, and collaborate with brands directly on our platform.",
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
  advertiser: [
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
      title: "Get Influencers",
      description:
        "Get matched with influencers to carry out your tasks directly from your dashboard.",
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

export const brands = [
  {
    id: 1,
    path: "/images/brands/1.jpg",
  },
  {
    id: 2,
    path: "/images/brands/2.png",
  },
  {
    id: 3,
    path: "/images/brands/3.png",
  },
  {
    id: 4,
    path: "/images/brands/4.png",
  },
  {
    id: 5,
    path: "/images/brands/5.png",
  },
  {
    id: 6,
    path: "/images/brands/6.png",
  },
  {
    id: 7,
    path: "/images/brands/7.png",
  },
  {
    id: 8,
    path: "/images/brands/8.png",
  },
  {
    id: 9,
    path: "/images/brands/9.png",
  },
  {
    id: 10,
    path: "/images/brands/10.png",
  },
  {
    id: 11,
    path: "/images/brands/11.png",
  },
  {
    id: 12,
    path: "/images/brands/12.png",
  },
  {
    id: 13,
    path: "/images/brands/13.png",
  },
  {
    id: 14,
    path: "/images/brands/14.png",
  },
  {
    id: 15,
    path: "/images/brands/15.png",
  },
  {
    id: 16,
    path: "/images/brands/16.png",
  },
  {
    id: 17,
    path: "/images/brands/17.png",
  },
  {
    id: 18,
    path: "/images/brands/18.png",
  },
  {
    id: 19,
    path: "/images/brands/19.png",
  },
];

export const caseStudies = [
  {
    id: 1,
    slug: "celebrity-marketing-wizkid-pepsi",
    title: "Celebrity Marketing: The $350,000 Question",
    excerpt:
      "When Wizkid fronts a Pepsi campaign for $350,000, one person gets paid. But what if that same budget activated 1,000 micro-influencers earning $350 each?",
    image: "/images/case/pepsi.png",
    category: "Celebrity vs Micro-Influencer",
    readTime: "12 min read",
    date: "2024-01-15",
  },
  {
    id: 2,
    slug: "political-campaigns-micro-influencers",
    title: "Winning Elections: Why Micro-Influencers Are Safer",
    excerpt:
      "Examining how celebrity political endorsements in Nigeria triggered backlash for Portable, Davido, Eniola Badmus, and others - and why micro-influencers are structurally protected.",
    image: "/images/case/politics.png",
    category: "Political Campaigns",
    readTime: "15 min read",
    date: "2024-02-20",
  },
  {
    id: 3,
    slug: "startup-app-first-customer",
    title: "My Startup App is Ready. How Do I Find My First Customer?",
    excerpt:
      "Building an app is difficult and expensive. But even more challenging is what comes next: finding the first customer who will trust an unknown brand.",
    image: "/images/case/app_is_ready.png",
    category: "Startup Growth",
    readTime: "14 min read",
    date: "2024-03-10",
  },
  {
    id: 4,
    slug: "walk-in-businesses-nightclubs-restaurants",
    title: "Getting People Into Your Walk-In Store",
    excerpt:
      "For nightclubs, restaurants, salons, and fashion houses, being digital is not enough. The biggest barrier is psychological: people fear walking in.",
    image: "/images/case/building.png",
    category: "Physical Businesses",
    readTime: "16 min read",
    date: "2024-01-25",
  },
];
