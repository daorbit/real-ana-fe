import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import { colorIcon, detailedIconSize } from "./icons";

const WHITE = "#fff";
const LINE_RED = "#ef5a4c";
const LINE_BLUE = "#3f8ff5";

const AUDIT_ROWS = [226, 336];

const GEAR_CENTER = 256;
const GEAR_TEETH = 8;

function gearPoint(degrees: number, radius: number) {
  const radians = (degrees * Math.PI) / 180;
  const x = GEAR_CENTER + radius * Math.cos(radians);
  const y = GEAR_CENTER + radius * Math.sin(radians);
  return `${x.toFixed(1)} ${y.toFixed(1)}`;
}

const GEAR_PATH = `M${Array.from({ length: GEAR_TEETH }, (_, tooth) => {
  const angle = (tooth * 360) / GEAR_TEETH;
  return [
    gearPoint(angle - 15, 172),
    gearPoint(angle - 9, 224),
    gearPoint(angle + 9, 224),
    gearPoint(angle + 15, 172),
  ].join("L");
}).join("L")}Z`;

export const HomeColorIcon = colorIcon("HomeColorIcon", ["yellow", "deepBlue", "red"], (paint) => (
  <>
    <rect x="84" y="230" width="344" height="246" rx="44" fill={paint("yellow")} />
    <path d="M196 476V352A36 36 0 0 1 232 316H280A36 36 0 0 1 316 352V476Z" fill={paint("deepBlue")} />
    <path d="M232 46A36 36 0 0 1 280 46L482 222A32 32 0 0 1 461 278H51A32 32 0 0 1 30 222Z" fill={paint("red")} />
  </>
));

export const DashboardsColorIcon = colorIcon("DashboardsColorIcon", ["blue", "yellow", "red", "green"], (paint) => (
  <>
    <rect x="36" y="36" width="204" height="272" rx="56" fill={paint("blue")} />
    <rect x="272" y="36" width="204" height="156" rx="56" fill={paint("yellow")} />
    <rect x="272" y="224" width="204" height="252" rx="56" fill={paint("red")} />
    <rect x="36" y="340" width="204" height="136" rx="56" fill={paint("green")} />
  </>
));

export const WebsiteAnalyticsIcon = colorIcon("WebsiteAnalyticsIcon", ["yellow", "red", "blue"], (paint) => (
  <>
    <rect x="24" y="262" width="116" height="226" rx="40" fill={paint("yellow")} />
    <rect x="198" y="326" width="116" height="162" rx="40" fill={paint("red")} />
    <rect x="372" y="176" width="116" height="312" rx="40" fill={paint("blue")} />
    <path d="M82 142L256 212" stroke={LINE_RED} strokeWidth="24" />
    <path d="M256 212L430 72" stroke={LINE_BLUE} strokeWidth="24" />
    <circle cx="82" cy="142" r="48" fill={paint("yellow")} />
    <circle cx="256" cy="212" r="48" fill={paint("red")} />
    <circle cx="430" cy="72" r="48" fill={paint("blue")} />
  </>
));

export const SearchVisibilityColorIcon = forwardRef<SVGSVGElement, LucideProps>(({ size = 24 }, _ref) => {
  const iconSize = detailedIconSize(size);
  return <GoogleMark size={typeof iconSize === "number" ? iconSize : undefined} />;
});

SearchVisibilityColorIcon.displayName = "SearchVisibilityColorIcon";

export const SeoColorIcon = colorIcon("SeoColorIcon", ["blue", "yellow", "red"], (paint) => (
  <>
    <path
      d="M118 190C107 166 90 152 70 152C44 152 24 174 24 202C24 225 35 240 52 252L92 282C107 293 116 308 116 325C116 345 95 358 70 358C50 358 34 344 20 321"
      stroke={paint("blue")}
      strokeWidth="44"
    />
    <path d="M175 130H285V174H223V233H285V277H223V336H285V380H175Z" fill={paint("yellow")} />
    <ellipse cx="412" cy="255" rx="73" ry="103" stroke={paint("red")} strokeWidth="44" />
  </>
));

export const LeadCaptureColorIcon = colorIcon("LeadCaptureColorIcon", ["red", "paper"], (paint) => (
  <>
    <path d="M56 150H184V270A72 72 0 0 0 328 270V150H456V270A200 200 0 0 1 56 270Z" fill={paint("red")} />
    <rect x="56" y="48" width="128" height="88" rx="28" fill={paint("paper")} />
    <rect x="328" y="48" width="128" height="88" rx="28" fill={paint("paper")} />
  </>
));

export const ScheduledPostsIcon = colorIcon("ScheduledPostsIcon", ["red", "paper"], (paint) => (
  <>
    <rect x="16" y="64" width="480" height="432" rx="84" fill={paint("red")} />
    <rect x="112" y="16" width="56" height="112" rx="28" fill={paint("paper")} />
    <rect x="344" y="16" width="56" height="112" rx="28" fill={paint("paper")} />
    <path
      d="M120 315V285Q120 248 157 248H208Q245 248 245 285V320Q245 335 235 346L187 400H245V440H120V405L186 335Q193 327 193 318V295Q193 286 184 286H180Q172 286 172 295V315Z"
      fill={WHITE}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M302 248H353Q390 248 390 285V305H338V295Q338 286 329 286H326Q317 286 317 295V322H353Q390 322 390 359V403Q390 440 353 440H302Q265 440 265 403V285Q265 248 302 248ZM317 360V394Q317 403 326 403H333Q342 403 342 394V369Q342 360 333 360Z"
      fill={WHITE}
    />
  </>
));

export const ReportsColorIcon = colorIcon("ReportsColorIcon", ["blue", "deepBlue"], (paint) => (
  <>
    <path d="M136 20H306L432 146V436A56 56 0 0 1 376 492H136A56 56 0 0 1 80 436V76A56 56 0 0 1 136 20Z" fill={paint("blue")} />
    <path d="M306 20L432 146H346A40 40 0 0 1 306 106Z" fill={paint("deepBlue")} />
    <rect x="148" y="320" width="56" height="104" rx="18" fill={WHITE} />
    <rect x="228" y="256" width="56" height="168" rx="18" fill={WHITE} />
    <rect x="308" y="200" width="56" height="224" rx="18" fill={WHITE} />
  </>
));

export const AllAppsColorIcon = colorIcon("AllAppsColorIcon", ["red", "yellow", "blue", "green"], (paint) => (
  <>
    <rect x="40" y="40" width="196" height="196" rx="56" fill={paint("red")} />
    <rect x="276" y="40" width="196" height="196" rx="56" fill={paint("yellow")} />
    <rect x="40" y="276" width="196" height="196" rx="56" fill={paint("blue")} />
    <circle cx="374" cy="374" r="98" fill={paint("green")} />
    <path d="M374 326V422M326 374H422" stroke={WHITE} strokeWidth="32" strokeLinecap="round" />
  </>
));

export const MembersColorIcon = colorIcon("MembersColorIcon", ["purple", "blue"], (paint) => (
  <>
    <circle cx="362" cy="176" r="76" fill={paint("purple")} />
    <path d="M228 446C228 350 288 288 362 288S496 350 496 446A30 30 0 0 1 466 476H258A30 30 0 0 1 228 446Z" fill={paint("purple")} />
    <circle cx="196" cy="150" r="100" fill={paint("blue")} />
    <path d="M20 442C20 332 100 276 196 276S372 332 372 442A34 34 0 0 1 338 476H54A34 34 0 0 1 20 442Z" fill={paint("blue")} />
  </>
));

export const BrandingColorIcon = colorIcon("BrandingColorIcon", ["yellow", "red", "blue", "green", "purple"], (paint) => (
  <>
    <path
      d="M256 28C116 28 24 134 24 256C24 386 126 484 250 484C294 484 318 458 318 426C318 394 294 382 294 350C294 320 318 300 350 300H408C458 300 488 264 488 214C488 112 386 28 256 28Z"
      fill={paint("yellow")}
    />
    <circle cx="164" cy="170" r="46" fill={paint("red")} />
    <circle cx="290" cy="122" r="46" fill={paint("blue")} />
    <circle cx="396" cy="188" r="44" fill={paint("green")} />
    <circle cx="116" cy="302" r="44" fill={paint("purple")} />
  </>
));

export const BillingColorIcon = colorIcon("BillingColorIcon", ["green", "deepGreen", "yellow"], (paint) => (
  <>
    <rect x="20" y="88" width="472" height="336" rx="68" fill={paint("green")} />
    <rect x="20" y="168" width="472" height="72" fill={paint("deepGreen")} />
    <rect x="68" y="304" width="124" height="64" rx="22" fill={paint("yellow")} />
  </>
));

export const DevelopersColorIcon = colorIcon("DevelopersColorIcon", ["purple", "deepPurple"], (paint) => (
  <>
    <rect x="24" y="56" width="464" height="400" rx="72" fill={paint("purple")} />
    <path d="M24 158V128A72 72 0 0 1 96 56H416A72 72 0 0 1 488 128V158Z" fill={paint("deepPurple")} />
    <path
      d="M192 228L122 300L192 372M320 228L390 300L320 372M280 216L232 384"
      stroke={WHITE}
      strokeWidth="40"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
));

export const AuditLogColorIcon = colorIcon("AuditLogColorIcon", ["orange", "paper", "slate"], (paint) => (
  <>
    <rect x="60" y="60" width="392" height="432" rx="68" fill={paint("orange")} />
    <rect x="104" y="112" width="304" height="336" rx="32" fill={paint("paper")} />
    <rect x="168" y="20" width="176" height="96" rx="36" fill={paint("slate")} />
    {AUDIT_ROWS.map((y) => (
      <g key={y}>
        <path
          d={`M140 ${y}L168 ${y + 28}L212 ${y - 30}`}
          stroke="#14a35f"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="246" y={y - 16} width="130" height="32" rx="16" fill="#8d9bb2" />
      </g>
    ))}
  </>
));

export const WorkspacesColorIcon = colorIcon("WorkspacesColorIcon", ["orange", "yellow"], (paint) => (
  <>
    <path d="M28 124A68 68 0 0 1 96 56H192A68 68 0 0 1 240 76L272 108H416A68 68 0 0 1 484 176V240H28Z" fill={paint("orange")} />
    <rect x="20" y="168" width="472" height="288" rx="68" fill={paint("yellow")} />
  </>
));

export const LanguageColorIcon = colorIcon("LanguageColorIcon", ["purple", "blue"], (paint) => (
  <>
    <rect x="196" y="36" width="292" height="236" rx="64" fill={paint("purple")} />
    <path
      d="M96 136H282A72 72 0 0 1 354 208V344A72 72 0 0 1 282 416H186L108 482C98 490 84 483 84 470V415A72 72 0 0 1 24 344V208A72 72 0 0 1 96 136Z"
      fill={paint("blue")}
    />
    <path
      d="M132 360L189 196L246 360M152 306H226"
      stroke={WHITE}
      strokeWidth="30"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
));

export const AdminToolsColorIcon = colorIcon("AdminToolsColorIcon", ["blue"], (paint) => (
  <>
    <path
      d="M256 24L440 88A28 28 0 0 1 460 114V236C460 360 372 450 266 486A32 32 0 0 1 246 486C140 450 52 360 52 236V114A28 28 0 0 1 72 88Z"
      fill={paint("blue")}
    />
    <path d="M164 256L232 322L352 188" stroke={WHITE} strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" />
  </>
));

export const RequestFeatureColorIcon = colorIcon("RequestFeatureColorIcon", ["yellow", "slate"], (paint) => (
  <>
    <path
      d="M256 24C150 24 72 104 72 204C72 268 104 318 146 352C164 366 172 382 172 400H340C340 382 348 366 366 352C408 318 440 268 440 204C440 104 362 24 256 24Z"
      fill={paint("yellow")}
    />
    <rect x="172" y="416" width="168" height="40" rx="20" fill={paint("slate")} />
    <rect x="204" y="464" width="104" height="32" rx="16" fill={paint("slate")} />
  </>
));

export const ContactSupportColorIcon = colorIcon("ContactSupportColorIcon", ["paper", "red"], (paint) => (
  <>
    <circle cx="256" cy="256" r="176" stroke={paint("paper")} strokeWidth="96" />
    <circle
      cx="256"
      cy="256"
      r="176"
      stroke={paint("red")}
      strokeWidth="96"
      strokeDasharray="138.2 138.2"
      strokeDashoffset="69.1"
    />
  </>
));

export const LegalColorIcon = colorIcon("LegalColorIcon", ["yellow", "blue"], (paint) => (
  <>
    <path d="M112 110L44 268M112 110L180 268M400 110L332 268M400 110L468 268" stroke="#8d9bb2" strokeWidth="18" />
    <rect x="236" y="48" width="40" height="376" rx="20" fill={paint("yellow")} />
    <rect x="64" y="92" width="384" height="36" rx="18" fill={paint("yellow")} />
    <rect x="148" y="428" width="216" height="48" rx="24" fill={paint("yellow")} />
    <path d="M196 268H28A84 84 0 0 0 196 268Z" fill={paint("blue")} />
    <path d="M484 268H316A84 84 0 0 0 484 268Z" fill={paint("blue")} />
  </>
));

export const LogOutColorIcon = colorIcon("LogOutColorIcon", ["red"], (paint) => (
  <>
    <rect x="24" y="24" width="464" height="464" rx="112" fill={paint("red")} />
    <path
      d="M232 136H168A40 40 0 0 0 128 176V336A40 40 0 0 0 168 376H232M232 256H392M324 184L396 256L324 328"
      stroke={WHITE}
      strokeWidth="44"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
));

export const MoreColorIcon = colorIcon("MoreColorIcon", ["red", "yellow", "blue"], (paint) => (
  <>
    <circle cx="88" cy="256" r="60" fill={paint("red")} />
    <circle cx="256" cy="256" r="60" fill={paint("yellow")} />
    <circle cx="424" cy="256" r="60" fill={paint("blue")} />
  </>
));

export const SettingsColorIcon = colorIcon("SettingsColorIcon", ["slate", "blue"], (paint) => (
  <>
    <path d={GEAR_PATH} fill={paint("slate")} stroke={paint("slate")} strokeWidth="30" strokeLinejoin="round" />
    <circle cx={GEAR_CENTER} cy={GEAR_CENTER} r="78" fill={paint("blue")} />
  </>
));
