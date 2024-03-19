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
app.get("/product", async (req, res) => {
  try {
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

    // Function to fetch products for a given page number
    async function getProductsForPage(pageNumber, accessToken) {
      try {
        const response = await axios.get(
          `https://api.pax8.com/v1/products?page=${pageNumber}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        console.error(`Error fetching products for page ${pageNumber}:`, error);
        throw error;
      }
    }

    // Function to fetch all products
    async function getAllProducts() {
      try {
        const accessToken = await getAccessToken();
        let allProducts = [];
        const totalPages = 171; // Assuming total number of pages from response

        // Fetch products for each page and concatenate them into a single array
        for (let pageNumber = 0; pageNumber < totalPages; pageNumber++) {
          const productsResponse = await getProductsForPage(
            pageNumber,
            accessToken
          );
          console.log(`Page ${pageNumber} response:`, productsResponse); // Log the response for debugging
          allProducts.push(productsResponse);
        }

        return allProducts;
      } catch (error) {
        console.error("Error fetching all products:", error);
        throw error;
      }
    }

    // Example usage
    const allproduct = getAllProducts();
    res.send(allproduct);
  } catch (error) {
    console.error("Error fetching data from PAX8 API:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
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
app.patch("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const { data } = await axios.post(`${PAX8_API_URL}/token`, {
      client_id: "eRRHW7PA1sSiDEceTDYVpz7GSJTJPPQn",
      client_secret:
        "wsMSAPVJ3LcyraUH6weKMTIsngdjInxXFHxkPJn732h2v1NRlyhLmeaMGjQYIN4q",
      audience: "api://p8p.client",
      grant_type: "client_credentials",
    });

    const accessToken = data.access_token;

    const response = await axios.patch(`${PAX8_API_URL}/products/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: req.body,
    });

    console.log("Response from PAX8 API:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from PAX8 API:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log("working the shell");
});
