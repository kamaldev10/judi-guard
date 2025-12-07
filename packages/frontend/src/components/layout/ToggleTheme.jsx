import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { Button } from "../ui/Button";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Efek untuk menandai komponen sudah mounted
  useEffect(() => setMounted(true), []);

  const handleToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -90 },
    visible: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0.5, rotate: 90 },
  };

  const transition = { duration: 0.2, ease: "easeInOut" };

  if (!mounted) {
    // Anda bisa return null atau placeholder sederhana non-ikon
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="relative overflow-hidden"
      >
        <div className="h-[1.2rem] w-[1.2rem] bg-blue-300 rounded-sm animate-pulse"></div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle theme"
      className="relative overflow-hidden rounded-full bg-transparent transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="light"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={iconVariants}
            transition={transition}
            className="absolute inset-0 flex items-center justify-center bg-amber-500 hover:bg-amber-600"
          >
            <Sun className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
          </motion.div>
        ) : (
          <motion.div
            key="dark"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={iconVariants}
            transition={transition}
            className="absolute inset-0 flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-stone-50"
          >
            <Moon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
