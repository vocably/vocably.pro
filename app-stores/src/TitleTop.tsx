import { createContext, useContext, useState, type ReactNode } from 'react';

type TitleTop = {
  // Distance from the top of the canvas to the anchor `.title`, in format px.
  // `null` until the anchor screenshot has been measured.
  top: number | null;
  setTop: (top: number) => void;
};

const TitleTopContext = createContext<TitleTop | null>(null);

// Shares the anchor title position between the screenshots of one language.
export const TitleTopProvider = ({ children }: { children: ReactNode }) => {
  const [top, setTop] = useState<number | null>(null);
  return <TitleTopContext value={{ top, setTop }}>{children}</TitleTopContext>;
};

export const useTitleTop = () => {
  const context = useContext(TitleTopContext);
  if (!context) throw new Error('useTitleTop must be used inside <Device>');
  return context;
};
