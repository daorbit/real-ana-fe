import { colorIcon } from "./icons";

const WHITE = "#fff";

export {
  Languages as LanguageColorIcon,
  ShieldCheck as AdminToolsColorIcon,
  Lightbulb as RequestFeatureColorIcon,
  LifeBuoy as ContactSupportColorIcon,
  Scale as LegalColorIcon,
  LogOut as LogOutColorIcon,
} from "lucide-react";

export const AllAppsColorIcon = colorIcon("AllAppsColorIcon", ["red", "yellow", "blue", "green"], (paint) => (
  <>
    <rect x="40" y="40" width="196" height="196" rx="56" fill={paint("red")} />
    <rect x="276" y="40" width="196" height="196" rx="56" fill={paint("yellow")} />
    <rect x="40" y="276" width="196" height="196" rx="56" fill={paint("blue")} />
    <circle cx="374" cy="374" r="98" fill={paint("green")} />
    <path d="M374 326V422M326 374H422" stroke={WHITE} strokeWidth="32" strokeLinecap="round" />
  </>
));

export const MoreColorIcon = colorIcon("MoreColorIcon", ["red", "yellow", "blue"], (paint) => (
  <>
    <circle cx="88" cy="256" r="60" fill={paint("red")} />
    <circle cx="256" cy="256" r="60" fill={paint("yellow")} />
    <circle cx="424" cy="256" r="60" fill={paint("blue")} />
  </>
));
