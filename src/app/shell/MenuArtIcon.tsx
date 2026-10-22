const MENU_ART_SIZE = 18;

export function MenuArtIcon({ src }: { src: string }) {
  return <img src={src} width={MENU_ART_SIZE} height={MENU_ART_SIZE} alt="" className="nav-app-logo" />;
}
