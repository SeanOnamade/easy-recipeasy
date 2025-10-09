import { Spectral } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { AppProvider } from "../contexts/AppContext";
import ErrorBoundary from "../components/ErrorBoundary";

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Easy Recipeasy",
  description: "Generate delicious recipes from your ingredients",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${spectral.variable} font-spectral antialiased`}
      >
        <ErrorBoundary>
          <AppProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
