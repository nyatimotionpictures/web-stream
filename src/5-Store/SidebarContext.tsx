import React, { ReactNode, createContext } from "react";

type SidebarProviderProps = {
  children: ReactNode;
};

type SidebarContextType = {
  isLargeOpen: boolean;
  isSmallOpen: boolean;
  toggle: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarContext() {
  const value = React.useContext(SidebarContext);
  if (value == null) throw Error("Cannot use outside of the SidebarProvider");
  return value;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isLargeOpen, setIsLargeOpen] = React.useState(true);
  const [isSmallOpen, setIsSmallOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) {
        setIsSmallOpen(false);
      }
    };
    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  const isScreenSmall = () => {
    return window.innerWidth < 1024;
  };
  const toggle = () => {
    if (isScreenSmall()) {
      setIsSmallOpen((e) => !e);
    } else {
      setIsLargeOpen((e) => !e);
    }
  };

  const close = () => {
    if (isScreenSmall()) {
      setIsSmallOpen(false);
    } else {
      setIsLargeOpen(false);
    }
  };

  return (
    <SidebarContext.Provider
      value={{ isLargeOpen, isSmallOpen, toggle, close }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
