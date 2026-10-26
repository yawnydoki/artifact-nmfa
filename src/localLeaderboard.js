import { isDevModeEnabled } from "./devMode.js";

const queryParams =
  typeof window === "undefined"
    ? new URLSearchParams()
    : new URLSearchParams(window.location.search);

export const isLocalLeaderboardEnabled =
  import.meta.env.DEV &&
  (isDevModeEnabled || queryParams.get("local") === "true");

export const saveLocalLeaderboardEntry = async (entry) => {
  const response = await fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    throw new Error(`Local leaderboard request failed (${response.status}).`);
  }
};

export const fetchLocalLeaderboard = async () => {
  const response = await fetch("/api/leaderboard");

  if (!response.ok) {
    throw new Error(`Local leaderboard request failed (${response.status}).`);
  }

  return response.json();
};
