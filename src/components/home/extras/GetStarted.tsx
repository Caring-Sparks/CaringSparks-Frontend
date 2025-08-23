import React, { useState, MouseEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BrandForm from "../forms/BrandForm";
import InfluencerForm from "../forms/InfluencerForm";
import Image from "next/image";

type Option = {
  label: string;
  img: string;
  description: string;
  color: string;
  endpoint: string;
};

type GetStartedProps = {
  onClose: () => void;
  login: () => void;
};

const GetStarted: React.FC<GetStartedProps> = ({ onClose, login }) => {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const options: Option[] = [
    {
      label: "Register as an Influencer",
      img: "/icons/rocket.png",
      description: "Grow your audience and connect with brands.",
      color: "from-purple-500 to-pink-500",
      endpoint: "/api/register/influencer",
    },
    {
      label: "Register as a Brand",
      img: "/icons/organization.png",
      description: "Find the perfect influencers to promote your business.",
      color: "from-blue-500 to-cyan-500",
      endpoint: "/api/register/brand",
    },
  ];

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).id === "backdrop") onClose();
  };

  return (
    <div
      id="backdrop"
      onClick={handleBackdropClick}
      className="bg-slate-200/5 backdrop-blur-md fixed inset-0 z-50 flex justify-center items-center lg:px-6 p-2"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Get Started
              </h1>
              <p className="text-gray-600 text-center mt-2">
                Start your journey today by choosing your role
              </p>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                {options.map((opt) => (
                  <motion.button
                    key={opt.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition bg-gradient-to-br ${opt.color} text-white`}
                    onClick={() => setSelected(opt.label)}
                  >
                    <div className="mb-4">
                      <Image
                        src={opt.img}
                        alt={opt.label}
                        width={200}
                        height={200}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-semibold">{opt.label}</h3>
                    <p className="text-sm opacity-90 mt-2">{opt.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {selected === "Register as a Brand" ? (
                <BrandForm onBack={() => setSelected(null)} login={login} />
              ) : (
                <InfluencerForm
                  onBack={() => setSelected(null)}
                  login={login}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GetStarted;
