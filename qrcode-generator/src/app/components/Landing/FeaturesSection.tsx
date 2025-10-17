import React from "react";
import { motion } from "framer-motion";
import { Feature, FeaturesSectionProps } from "@/types/landing";

export default function FeaturesSection({ featureVariants }: Readonly<FeaturesSectionProps>) {
  const features: Feature[] = [
    {
      id: "feature-planning",
      title: "Event Planning",
      desc: "Seamlessly plan and schedule your events",
      text: "Seamlessly plan and schedule your events",
      icon: "📅",
    },
    {
      id: "feature-guest-management",
      title: "Guest Management",
      desc: "Efficiently manage attendee lists and invitations",
      text: "Efficiently manage attendee lists and invitations",
      icon: "👥",
    },
    {
      id: "feature-analytics",
      title: "Analytics",
      desc: "Comprehensive insights and reporting tools",
      text: "Comprehensive insights and reporting tools",
      icon: "📊",
    },
  ];

  return (
    <motion.div
      className="mt-24 lg:mt-32"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={feature.id}
            className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm p-8 rounded-xl border border-gray-100 dark:border-gray-700/20 shadow-sm flex flex-col items-center text-center"
            custom={i}
            initial="hidden"
            animate="visible"
            variants={featureVariants}
            whileHover={{
              y: -8,
              boxShadow: "0 15px 30px rgba(0,0,0,0.05), 0 5px 15px rgba(212, 175, 55, 0.1)",
              borderColor: "rgba(212, 175, 55, 0.3)",
              transition: { duration: 0.3 },
            }}
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
