import { Avatar, type AvatarProps } from "@mantine/core";

/**
 * A person's picture, with the one attribute Google's CDN insists on.
 *
 * `lh3.googleusercontent.com` refuses to serve a profile image when the request
 * carries a cross-origin `Referer` header — the response is a 403 and the
 * browser draws its broken-image glyph, which is why Google-signed-up accounts
 * showed a torn icon everywhere their avatar appeared. Sending no referrer at
 * all is what makes those URLs load, and it costs nothing for the Cloudinary
 * uploads that were already fine.
 *
 * Wrapped rather than fixed at each call site so a new avatar added later
 * inherits this instead of rediscovering it.
 */
export function UserAvatar({
  src,
  name,
  imageProps,
  children,
  ...props
}: AvatarProps & {
  /** Used for the initials fallback when there is no picture, or it fails. */
  name?: string;
  src?: string | null;
}) {
  const initials = (name ?? "").trim().slice(0, 2).toUpperCase();

  return (
    <Avatar
      src={src || null}
      imageProps={{ referrerPolicy: "no-referrer", ...imageProps }}
      {...props}
    >
      {children ?? initials ?? null}
    </Avatar>
  );
}
