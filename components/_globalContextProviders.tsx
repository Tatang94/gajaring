import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./Tooltip";
import { SonnerToaster } from "./SonnerToaster";
import { AuthProvider } from "../helpers/useAuth";
import { SplashScreen } from "./SplashScreen";
import { useActiveAds } from "../helpers/useAds";
import { AdScript } from "./AdScript";

const queryClient = new QueryClient();

const AppContent = ({ children }: { children: ReactNode }) => {
  const { data: adsData, isFetching } = useActiveAds();
  
  // Filter for script ads only
  const scriptAds = adsData?.ads?.filter(ad => ad.type === 'script') || [];

  console.log('Active script ads loaded:', scriptAds.length);

  return (
    <>
      {children}
      {/* Render script ads globally */}
      {!isFetching && scriptAds.map(ad => (
        <AdScript 
          key={ad.id} 
          ad={ad} 
        />
      ))}
      <SonnerToaster />
    </>
  );
};

export const GlobalContextProviders = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    // Inject global CSS reset for full screen components
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow-x: hidden;
      }
      
      #root {
        height: 100%;
        width: 100%;
      }
      
      /* Remove default margins/padding on common elements */
      h1, h2, h3, h4, h5, h6, p, ul, ol, li, figure, figcaption, blockquote, dl, dd {
        margin: 0;
        padding: 0;
      }
      
      /* Ensure full viewport on mobile devices */
      @media (max-width: 768px) {
        html {
          -webkit-text-size-adjust: 100%;
        }
        
        body {
          -webkit-overflow-scrolling: touch;
          position: relative;
          min-height: 100vh;
          min-height: -webkit-fill-available;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Cleanup function to remove the style when component unmounts
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent>
            {children}
          </AppContent>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};