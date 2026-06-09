import { ENV } from "../constants";

const ping = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Keep-alive ping failed with status: ${response.status}`);
    }
  } catch (error) {}
};

// Pings the server every 10 minutes to prevent Render free tier from sleeping.
export const initKeepAlive = () => {
  const url = `${ENV.BACKEND_URL}/api/health`;

  if (ENV.NODE_ENV !== "production") {
    return;
  }

  console.log(`Keep-alive initialized. Pinging ${url} every 10 minutes.`);

  ping(url);
  setInterval(
    () => {
      ping(url);
    },
    10 * 60 * 1000,
  );
};
