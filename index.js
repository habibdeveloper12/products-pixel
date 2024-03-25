const express = require("express");
const cors = require("cors");
const app = express();

require("dotenv").config();

app.use(
  cors({
    origin: "*",
  })
);
const port = process.env.PORT || 8000;

app.use(express.json());

const axios = require("axios");

const PAX8_API_URL = "https://api.pax8.com/v1";

// app.get("/products", async (req, res) => {
//   try {
//     console.log("Sddf");
//     const { data } = await axios.post(`${PAX8_API_URL}/token`, {
//       client_id: "eRRHW7PA1sSiDEceTDYVpz7GSJTJPPQn",
//       client_secret:
//         "wsMSAPVJ3LcyraUH6weKMTIsngdjInxXFHxkPJn732h2v1NRlyhLmeaMGjQYIN4q",
//       audience: "api://p8p.client",
//       grant_type: "client_credentials",
//     });

//     const accessToken = data.access_token;

//     const response = await axios.get(`${PAX8_API_URL}/products`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     console.log("Response from PAX8 API:", response.data);
//     res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching data from PAX8 API:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.get("/products", async (req, res) => {
  const { page } = req.query;
  try {
    console.log("Sddf");
    const { data } = await axios.post(`${PAX8_API_URL}/token`, {
      client_id: "eRRHW7PA1sSiDEceTDYVpz7GSJTJPPQn",
      client_secret:
        "wsMSAPVJ3LcyraUH6weKMTIsngdjInxXFHxkPJn732h2v1NRlyhLmeaMGjQYIN4q",
      audience: "api://p8p.client",
      grant_type: "client_credentials",
    });

    const accessToken = data.access_token;

    const response = await axios.get(
      `https://api.pax8.com/v1/products?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Response from PAX8 API:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from PAX8 API:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/products/", async (req, res) => {
  const { page } = req.query;

  async function getAccessToken() {
    try {
      const response = await axios.post("https://api.pax8.com/v1/token", {
        client_id: "eRRHW7PA1sSiDEceTDYVpz7GSJTJPPQn",
        client_secret:
          "wsMSAPVJ3LcyraUH6weKMTIsngdjInxXFHxkPJn732h2v1NRlyhLmeaMGjQYIN4q",
        audience: "api://p8p.client",
        grant_type: "client_credentials",
      });

      return response.data.access_token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  // Function to fetch products
  async function getAllProducts(accessToken) {
    try {
      const response = await axios.get(
        `https://api.pax8.com/v1/products?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async function getProductPricing(productId, accessToken) {
    try {
      const response = await axios.get(
        `https://api.pax8.com/v1/products/${productId}/pricing`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        `Error fetching pricing for product ID ${productId}:`,
        error
      );
      throw error;
    }
  }

  try {
    const accessToken = await getAccessToken();
    const productsResponse = await getAllProducts(accessToken);

    // Extract product IDs
    const productIds = productsResponse.content.map((product) => product.id);

    // Fetch pricing for each product
    const productDetailsPromises = productIds.map((productId) =>
      getProductPricing(productId, accessToken)
    );

    // Wait for all pricing requests to resolve
    const productDetails = await Promise.all(productDetailsPromises);

    // Combine product details and pricing
    const productsWithPricing = productsResponse.content.map(
      (product, index) => ({
        ...product,
        pricing: productDetails[index],
      })
    );
    const alldone = { content: productsWithPricing };
    res.json(alldone);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log("working the shell");
});
