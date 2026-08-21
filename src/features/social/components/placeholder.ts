/**
 * Stands in for the post's image in the previews until one is attached.
 *
 * Served from our own public folder rather than a remote host: the preview is
 * the one place a broken image would look like the post itself is broken.
 */
export const PLACEHOLDER_IMAGE = "/post-placeholder.png";
