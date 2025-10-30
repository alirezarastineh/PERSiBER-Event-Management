import { motion } from "framer-motion";
import Image from "next/image";
import { AuthDecorativePanelProps } from "@/types/auth";

export default function AuthDecorativePanel({
  title,
  description,
  features,
  backgroundImageUrl,
}: Readonly<AuthDecorativePanelProps>) {
  return (
    <motion.div
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-deep-navy to-warm-charcoal z-0">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{
            backgroundImage: `url('${backgroundImageUrl}')`,
          }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center w-full h-full p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center"
        >
          <div className="flex justify-center mb-8">
            <Image
              src="https://i.imgur.com/MiwxKii.png"
              alt="PERSiBER Logo"
              width={160}
              height={160}
              className="object-contain"
              loading="lazy"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">{title}</h2>
          <p className="text-gray-300 max-w-md mx-auto">{description}</p>

          <div className="mt-12 space-y-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.id}
                className="flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
              >
                <div className="w-6 h-6 rounded-full bg-rich-gold flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-deep-navy"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-200">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
