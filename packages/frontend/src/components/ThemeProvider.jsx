import { ThemeProvider as NextThemesProvider } from "next-themes";
import PropTypes from "prop-types";

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
