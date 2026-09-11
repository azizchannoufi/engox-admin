import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  newOrderOpen: boolean;
  openNewOrder: () => void;
  closeNewOrder: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  toggleMobileNav: () =>
    set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  newOrderOpen: false,
  openNewOrder: () => set({ newOrderOpen: true }),
  closeNewOrder: () => set({ newOrderOpen: false }),
}));
