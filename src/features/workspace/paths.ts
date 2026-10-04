export const WORKSPACES_PATH = "/app/workspaces";
export const ADD_SITE_PARAM = "addSite";
export const SNIPPET_PARAM = "snippet";
export const ADD_SITE_PATH = `${WORKSPACES_PATH}?${ADD_SITE_PARAM}=1`;

export const siteSnippetPath = (siteId: string) =>
  `${WORKSPACES_PATH}?${SNIPPET_PARAM}=${encodeURIComponent(siteId)}`;
