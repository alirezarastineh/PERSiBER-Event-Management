import { motion } from "framer-motion";

export default function QRCodeFeatures() {
  const features = [
    {
      id: "feature-instant-generation",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Instant Generation",
      desc: "Create QR codes in seconds with minimal input required",
    },
    {
      id: "feature-secure-access",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Secure Access",
      desc: "Each QR code links to a secure, personalized guest page",
    },
    {
      id: "feature-print-ready",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
      ),
      title: "Print Ready",
      desc: "Download professionally formatted PDF invitations",
    },
  ];

  return (
    <motion.div
      className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.7 }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.id}
          className="card p-6 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.8 + index * 0.2,
            duration: 0.5,
          }}
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
        >
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-linear-to-r from-rich-gold/20 to-accent-amber/20 text-accent-amber mb-4">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
          <p className="text-gray-400">{feature.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
