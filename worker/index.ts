import weatherWorker from "./weather";
import type { RuntimeEnv } from "./types";

export default {
  async fetch(request: Request, env: RuntimeEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/weather")) {
      return weatherWorker.fetch(request, env);
    }
    // Fallback: serve static assets (for iframe SPA)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not found", { status: 404 });
  },
};
