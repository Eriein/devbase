"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { ItemDrawer } from "./ItemDrawer";

type ItemDrawerContextType = {
  openDrawer: (itemId: string) => void;
};

const ItemDrawerContext = createContext<ItemDrawerContextType | null>(null);

export function useItemDrawer() {
  const ctx = useContext(ItemDrawerContext);
  if (!ctx) throw new Error("useItemDrawer must be used within ItemDrawerProvider");
  return ctx;
}

export function ItemDrawerProvider({ children, isPro }: { children: ReactNode; isPro: boolean }) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const openDrawer = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  return (
    <ItemDrawerContext.Provider value={{ openDrawer }}>
      {children}
      <ItemDrawer
        itemId={selectedItemId}
        open={selectedItemId !== null}
        onClose={closeDrawer}
        isPro={isPro}
      />
    </ItemDrawerContext.Provider>
  );
}
