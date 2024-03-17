const express = require("express");
const cors = require("cors");
const app = express();

require("dotenv").config();

app.use(
  cors({
    origin: "*",
  })
);
app.set("port", 5000);
app.use(express.json());

const axios = require("axios");

const PAX8_API_URL = "https://api.pax8.com/v1";

app.get("/products", async (req, res) => {
  try {
    const { data } = await axios.post(`${PAX8_API_URL}/token`, {
      client_id: "eRRHW7PA1sSiDEceTDYVpz7GSJTJPPQn",
      client_secret:
        "wsMSAPVJ3LcyraUH6weKMTIsngdjInxXFHxkPJn732h2v1NRlyhLmeaMGjQYIN4q",
      audience: "api://p8p.client",
      grant_type: "client_credentials",
    });

    const accessToken = data.access_token;

    const response = await axios.get(`${PAX8_API_URL}/products`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("Response from PAX8 API:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from PAX8 API:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(() => {
  console.log("working the shell");
});
