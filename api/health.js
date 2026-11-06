
export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      message: "Method not allowed"
    });
  }

  return res.status(200).json({
    ok: true,
    app: "GlobalTopUp",
    version: "1.0.0",
    database: "not_connected",
    provider: "not_connected",
    message: "GlobalTopUp API is running"
  });
}
