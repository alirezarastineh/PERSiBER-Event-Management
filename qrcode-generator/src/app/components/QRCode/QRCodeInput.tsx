import { motion } from "framer-motion";
import Spinner from "../Common/Spinner";
import { QRCodeInputProps } from "@/types/qr";

export default function QRCodeInput({
  text,
  setText,
  onGenerate,
  loading,
}: Readonly<QRCodeInputProps>) {
  return (
    <motion.div
      className="bg-gray-800 rounded-2xl shadow-xl p-8 order-1 lg:order-1"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.7 }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-rich-gold to-accent-amber rounded-t-2xl"></div>

      <h2 className="text-2xl font-bold mb-6 text-white">Guest Information</h2>

      <div className="space-y-6">
        <div>
          <label htmlFor="guestName" className="block text-sm font-medium text-gray-300 mb-2">
            Guest Name
          </label>
          <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
            <input
              id="guestName"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the guest's full name"
              className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-accent-amber text-white placeholder-gray-400 transition-all duration-300"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  onGenerate();
                }
              }}
            />
          </motion.div>
        </div>

        <motion.button
          onClick={onGenerate}
          disabled={loading}
          className="w-full py-4 px-6 rounded-lg bg-linear-to-r from-rich-gold to-accent-amber text-deep-navy font-semibold text-lg tracking-wide shadow-lg transition-all duration-300"
          whileHover={{
            scale: 1.03,
            boxShadow: "0 10px 25px -5px rgba(212, 175, 55, 0.4)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Spinner sm />
              <span className="ml-2">Generating...</span>
            </span>
          ) : (
            "Generate QR Code"
          )}
        </motion.button>

        <motion.p
          className="text-sm text-gray-400 text-center italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          QR codes will link directly to the guest&apos;s information page
        </motion.p>
      </div>
    </motion.div>
  );
}
