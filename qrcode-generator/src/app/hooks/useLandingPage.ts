import { useAppSelector } from "@/redux/hooks";

export const useLandingPage = () => {
  // Get authentication state from Redux
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 1.2 + i * 0.2, duration: 0.5 },
    }),
  };

  return {
    isAuthenticated,
    containerVariants,
    itemVariants,
    featureVariants,
  };
};
