import { createContext, useContext } from "react";

export type SearchWidgetsConnect = {
  connect: () => void;
  connecting: boolean;
};

export const SearchWidgetsContext = createContext<SearchWidgetsConnect | null>(null);

export function useSearchWidgetsConnect() {
  return useContext(SearchWidgetsContext);
}
