import { createContext } from "react";

export const ShellMountedContext = createContext(false);

const NOOP = () => {};

export const RailAutoCollapseContext = createContext<(collapsed: boolean) => void>(NOOP);
