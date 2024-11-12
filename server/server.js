const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Creating an Express application instance
const app = express();
const PORT = 3000;
const JWT_SECRET = "yourSecretKey"; // Replace with your actual secret key

// Create a pool for PostgreSQL connection
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:1pjJ8WdUngSV@ep-small-brook-a5vpxef3.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }, // Ensure this is set to true in production
});

// Middleware to parse JSON bodies
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for JWT validation
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

app.get("/login", (req, res) => {
  res.sendFile("/Users/nima/dev/gctbl/public/login.html");
});

app.get("/register", (req, res) => {
  res.sendFile("/Users/nima/dev/gctbl/public/register.html");
});

// Route to register a new user with the "nom" field first
app.post("/api/register", async (req, res) => {
  const { nom, email, password } = req.body; // Now accepting "nom" first, followed by "email" and "password"

  console.log(nom, email, password);

  let client; // Declare the client variable

  try {
    // Use the connection pool for querying
    client = await pool.connect();

    // Check if the email already exists
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database, including "nom"
    await client.query(
      "INSERT INTO users (nom, email, password) VALUES ($1, $2, $3)",
      [nom, email, hashedPassword],
    );

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // set cookie
    res.cookie("token", token, { httpOnly: true });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Release the client back to the pool if it's defined
    if (client) {
      client.release();
    }
  }
});

// Route to authenticate and log in a user
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  let client; // Declare the client variable

  try {
    client = await pool.connect();

    // Check if the email exists
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    // const user = result.rows[0];
    const user = result.rows[0];
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // const passwordMatch = password === user.password;
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // set cookie
    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Release the client back to the pool if it's defined
    if (client) {
      client.release();
    }
  }
});

// Protected route to get user details
app.get("/api/user", verifyToken, async (req, res) => {
  let client; // Declare the client variable

  try {
    client = await pool.connect();

    // Fetch user details using the decoded token
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      req.user.email,
    ]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Release the client back to the pool if it's defined
    if (client) {
      client.release();
    }
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to my User Registration and Login API!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
