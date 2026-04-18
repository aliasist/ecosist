import weatherWorker from "./weather";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/weather")) {
      return weatherWorker.fetch(request, env, ctx);
    }
    // Fallback: serve static assets (for iframe SPA)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};
