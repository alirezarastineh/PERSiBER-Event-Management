"use client";

import { motion } from "framer-motion";
import Heading from "../utils/Heading";
import { useLandingPage } from "@/app/hooks/useLandingPage";
import BackgroundElements from "./Landing/BackgroundElements";
import HeroSection from "./Landing/HeroSection";
import FeaturesSection from "./Landing/FeaturesSection";

export default function LandingPage() {
  const { isAuthenticated, containerVariants, itemVariants, featureVariants } = useLandingPage();

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Heading title="PERSiBER" />

      <section className="relative flex-grow flex flex-col items-center justify-center px-6 md:px-12">
        {/* Background Elements */}
        <BackgroundElements />

        {/* Hero Section */}
        <HeroSection
          isAuthenticated={isAuthenticated}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />

        {/* Features Section */}
        <FeaturesSection featureVariants={featureVariants} />
      </section>
    </motion.div>
  );
}
