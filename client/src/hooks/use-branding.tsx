import { createContext, useContext, useEffect, useState } from "react";

interface BrandingContextType {
  appName: string;
  setAppName: (name: string) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const DEFAULT_APP_NAME = "NexTrack";

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [appName, setAppName] = useState<string>(() => {
    return localStorage.getItem("app-name") || DEFAULT_APP_NAME;
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem("app-logo") || null;
  });

  useEffect(() => {
    localStorage.setItem("app-name", appName);
  }, [appName]);

  useEffect(() => {
    if (logoUrl) {
      localStorage.setItem("app-logo", logoUrl);
    } else {
      localStorage.removeItem("app-logo");
    }
  }, [logoUrl]);

  return (
    <BrandingContext.Provider value={{ appName, setAppName, logoUrl, setLogoUrl }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) throw new Error("useBranding must be used within BrandingProvider");
  return context;
}
