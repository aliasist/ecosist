// Weather API Worker for EcoSist
// Accepts: /api/weather?zipcode=XXXXX
// Returns: JSON weather data for the given zipcode

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/weather") {
      const zipcode = url.searchParams.get("zipcode");
      if (!zipcode) {
        return new Response(JSON.stringify({ error: "Missing zipcode" }), { status: 400 });
      }
      // Example: Use Open-Meteo or similar free API (replace with your key/service)
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?postal_code=${zipcode}&country=US&current_weather=true`);
      if (!weatherRes.ok) {
        return new Response(JSON.stringify({ error: "Weather API error" }), { status: 502 });
      }
      const weather = await weatherRes.json();
      return new Response(JSON.stringify(weather), {
        headers: { "content-type": "application/json" },
      });
    }
    return new Response("Not found", { status: 404 });
  },
};
