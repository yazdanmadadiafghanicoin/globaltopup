
import pool from "./db.js";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGSERIAL PRIMARY KEY,
        country VARCHAR(100) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        operator VARCHAR(100) NOT NULL,
        service VARCHAR(20) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(30) DEFAULT 'demo_pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        app: "GlobalTopUp",
        message: "Orders API is ready"
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        message: "Method not allowed"
      });
    }

    const { country, phone, operator, service, amount } = req.body || {};

    if (!country || !phone || !operator ||
        !["credit", "data"].includes(service) ||
        !/^\d+(\.\d{1,2})?$/.test(String(amount)) ||
        Number(amount) <= 0 || Number(amount) > 500) {
      return res.status(400).json({
        ok: false,
        message: "Invalid order information"
      });
    }

    const result = await pool.query(
      `INSERT INTO orders
       (country, phone, operator, service, amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, country, service, amount, currency, status, created_at`,
      [
        String(country).slice(0, 100),
        String(phone).slice(0, 30),
        String(operator).slice(0, 100),
        service,
        Number(amount)
      ]
    );

    return res.status(201).json({
      ok: true,
      message: "Demo order saved successfully",
      order: result.rows[0]
    });

  } catch (error) {
    console.error("GlobalTopUp order error:", error.message);

    return res.status(500).json({
      ok: false,
      message: "Server or database error"
    });
  }
}
