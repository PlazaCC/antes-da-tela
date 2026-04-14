import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  capture_pageview: "history-change",
});
