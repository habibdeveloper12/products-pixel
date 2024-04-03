const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const session = require("express-session");
const app = express();
const PORT = 5000;

const database = require("./database/database");
database();
app.use("/", (req, res) => {
  res.send("hellw world");
});
// Configure view engine and views directory
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(
  session({
    secret: "your_secret_key", // Specify a secret for session management
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const { Facebook } = require("fb");
const fb = new Facebook({ version: "v12.0" });
const FB_APP_ID = "350708251284818";
const FB_APP_SECRET = "9377f8aeecebf304c6f61c1678fbb6c1";
const FB_REDIRECT_URI = "http://localhost:5000/auth/callback";
const clientID = "350708251284818";
const clientSecret = "9377f8aeecebf304c6f61c1678fbb6c1";
// Passport Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: "350708251284818",
      clientSecret: "9377f8aeecebf304c6f61c1678fbb6c1",
      callbackURL: "http://localhost:5000/auth/facebook/callback",
      profileFields: ["id", "displayName", "email", "manage_pages"],
    },
    function (accessToken, refreshToken, profile, done) {
      // This function is called after successful authentication
      // Here, you can handle user authentication or retrieve user data
      return done(null, profile);
    }
  )
);

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["manage_pages", "read_page_mailboxes"],
  })
);

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect or respond as needed
    console.log("success", req);
    res.redirect("/messages");
  }
);

app.get("/login", async (req, res) => {
  const response = await axios.get(
    `https://graph.facebook.com/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials`
  );
  console.log("Access Token Response:", response.data);
  res.render("login");
});

app.get("/auth/initiate", (req, res) => {
  const authUrl = fb.getLoginUrl({
    client_id: FB_APP_ID,
    redirect_uri: FB_REDIRECT_URI,
    scope: "manage_pages",
  });
  res.redirect(authUrl);
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { access_token } = await fb.api("oauth/access_token", {
      client_id: FB_APP_ID,
      client_secret: FB_APP_SECRET,
      redirect_uri: FB_REDIRECT_URI,
      code,
    });
    const userInfo = await fb.api("/me", {
      access_token: access_token,
    });
    // const userId = userInfo.id;
    // const userPagesResponse = await fb.api(`/${userId}/accounts`, {
    //   access_token: access_token,
    // });
    return {
      success: true,
      message: "Here is user Info",
      data: userInfo,
      redirectUrl: "/specific-page",
    };
  } catch (error) {
    console.error("Error saving authentication data:", error);
    // Return a failure message and redirect user
    return {
      success: false,
      message: "Failed to save authentication data",
      redirectUrl: "/error-page",
    };
  }
});

app.post("/auth/store", async (req, res) => {
  const { userId, accessToken, otherData } = req.body;

  try {
    await client.connect();

    const database = client.db("your-database-name");
    const collection = database.collection("authenticationData");

    const result = await collection.insertOne({
      userId: userId,
      accessToken: accessToken,
      otherData: otherData,
    });

    console.log("Authentication data saved successfully:", result);
    return {
      success: true,
      message: "Authentication data saved successfully",
    };
  } catch (error) {
    console.error("Error saving authentication data:", error);
    return { success: false, message: "Failed to save authentication data" };
  } finally {
    await client.close();
  }
});

app.post("/auth/refresh", async (req, res) => {
  const { accessToken } = req.body;
  const response = await axios.get(`https://graph.facebook.com/debug_token`, {
    params: {
      input_token: accessToken,
      access_token: "your-app-access-token",
    },
  });

  if (response.data.data.is_valid) {
    console.log("Access token is valid");
  } else {
    res.redirect("/auth/initiate");
  }
  res.status(200).send("Authentication data refreshed successfully");
});

app.delete("/auth/remove", async (req, res) => {
  const { userId } = req.body;

  try {
    await client.connect();

    const database = client.db("your-database-name");
    const collection = database.collection("authenticationData");

    const result = await collection.deleteOne({ userId: userId });

    if (result.deletedCount === 1) {
      res.json({
        success: true,
        message: "Authentication data removed successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User authentication data not found",
      });
    }
  } catch (error) {
    console.error("Error removing authentication data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove authentication data",
    });
  } finally {
    await client.close();
  }
});
app.post("/auth/reverify", async (req, res) => {
  const { userId } = req.body;

  try {
    const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(
      FB_REDIRECT_URI
    )}&scope=manage_pages&auth_type=reauthenticate&state=${userId}`;

    res.json({ success: true, redirectUrl: authUrl });
  } catch (error) {
    console.error("Error triggering permission re-verification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger permission re-verification",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
