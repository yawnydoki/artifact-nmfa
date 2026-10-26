const DEV_MODE_STORAGE_KEY = "artifact_dev_mode";

const getDevModeFromBrowser = () => {
  if (typeof window === "undefined" || !import.meta.env.DEV) return false;

  const queryValue = new URLSearchParams(window.location.search).get("dev");

  if (queryValue === "true") {
    window.localStorage.setItem(DEV_MODE_STORAGE_KEY, "true");
  } else if (queryValue === "false") {
    window.localStorage.removeItem(DEV_MODE_STORAGE_KEY);
  }

  return (
    queryValue === "true" ||
    window.localStorage.getItem(DEV_MODE_STORAGE_KEY) === "true"
  );
};

export const isDevModeEnabled = getDevModeFromBrowser();
