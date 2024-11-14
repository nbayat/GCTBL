const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser");
const Papa = require("papaparse");

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

// Middleware to parse JSON bodies:
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(cookieParser()); // This should be set before your routes
app.use(express.json()); // Middleware to parse JSON bodies

function checkCookieMiddleware(req, res, next) {
  // Check if the specific cookie exists
  if (req.cookies && req.cookies.token) {
    // Cookie exists, proceed to the next middleware or route
    return next();
  }
  // If cookie does not exist, redirect to /login
  return res.redirect("/login");
}

// Middleware to check if the user is authenticated
app.use("/dashboard", checkCookieMiddleware);
app.use("/profile", checkCookieMiddleware);
app.use("/account/add", checkCookieMiddleware);
app.use("/account/update", checkCookieMiddleware);
app.use("/history", checkCookieMiddleware);
app.use("/api/user/connections", checkCookieMiddleware);
app.use("/transactions", checkCookieMiddleware);
app.use("/api/user/update", checkCookieMiddleware);
app.use("/api/transaction/user/csv", checkCookieMiddleware);
app.use("/api/account/add", checkCookieMiddleware);
app.use("/api/account/update", checkCookieMiddleware);
app.use("/api/accounts/delete", checkCookieMiddleware);
app.use("/api/accounts/getAll", checkCookieMiddleware);
app.use("/api/accounts/getById", checkCookieMiddleware);
app.use("/api/transactions/add", checkCookieMiddleware);
app.use("/api/transactions/getAll", checkCookieMiddleware);

app.get("/login", (req, res) => {
  const filePath = path.join(__dirname, "..", "public", "login.html");
  res.sendFile(filePath);
});

app.get("/register", (req, res) => {
  const filePath = path.join(__dirname, "..", "public", "register.html");
  res.sendFile(filePath);
});

app.get("/dashboard", (req, res) => {
  const filePath = path.join(__dirname, "..", "public", "dashboard.html");
  res.sendFile(filePath);
});

app.get("/js/dashboard", (req, res) => {
  const filePath = path.join(__dirname, "..", "src", "dashboard.js");
  res.sendFile(filePath);
});

app.get("/account/add", (req, res) => {
  const filePath = path.join(__dirname, "..", "public", "addBankAccount.html");
  res.sendFile(filePath);
});

app.get("/js/account/add", (req, res) => {
  const filePath = path.join(__dirname, "..", "src", "addBankAccount.js");
  res.sendFile(filePath);
});

app.get("/account/update", (req, res) => {
  const filePath = path.join(__dirname, "..", "public", "editBankAccount.html");
  res.sendFile(filePath);
});

app.get("/js/account/update", (req, res) => {
  const filePath = path.join(__dirname, "..", "src", "editBankAccount.js");
  res.sendFile(filePath);
});

app.get("/history", (req, res) => {
  const filePath = path.join(
    __dirname,
    "..",
    "public",
    "bankTransactionsHistory.html",
  );
  res.sendFile(filePath);
});

app.get("/js/history", (req, res) => {
  const filePath = path.join(
    __dirname,
    "..",
    "src",
    "bankTransactionsHistory.js",
  );
  res.sendFile(filePath);
});

app.get("/homepage", (req, res) => {
  const filePath = path.join(__dirname, "..", "public", "homepage.html");
  res.sendFile(filePath);
});

app.get("/", (req, res) => {
  res.redirect("/homepage"); // Redirige vers /homepage pour toute route non trouvée
});

app.get("/api/user/connections", async (req, res) => {
  let client;

  try {
    // Check for the token in cookies
    const token = await req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET); // Use your JWT_SECRET
    const userEmail = decoded.email; // Assume the email was encoded in the token

    client = await pool.connect();

    // Get the user ID using the email from the decoded token
    const userResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [userEmail],
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch all connection records for the user
    const connectionsResult = await client.query(
      "SELECT access_date, access_time, ip_address FROM ip WHERE user_id = $1 ORDER BY access_date DESC, access_time DESC",
      [user.id],
    );

    const connections = connectionsResult.rows;

    // Send the connections data back as the response
    res.status(200).json({ connections });
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

app.get("/transactions", (req, res) => {
  const filePath = path.join(
    __dirname,
    "..",
    "public",
    "addBankTransaction.html",
  );
  res.sendFile(filePath);
});

app.get("/js/transactions", (req, res) => {
  const filePath = path.join(__dirname, "..", "src", "addBankTransaction.js");
  res.sendFile(filePath);
});

app.get("/profile", (req, res) => {
  const filePath = path.join(__dirname, "..", "public", "userProfile.html");
  res.sendFile(filePath);
});

app.get("/js/profile", (req, res) => {
  const filePath = path.join(__dirname, "..", "src", "userProfile.js");
  res.sendFile(filePath);
});

// Route to register a new user with the "nom" field first
app.post("/api/register", async (req, res) => {
  const { nom, email, password } = req.body; // Accepting "nom", "email", and "password"

  let client;

  try {
    // Use the connection pool for querying
    client = await pool.connect();

    // Check if the email already exists
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0 || password.length < 8) {
      if (password.length < 8)
        res.cookie("errorMessage", "Le mot de passe doit faire 8 caractères.", {
          httpOnly: false,
          maxAge: 10000,
        });
      if (result.rows.length > 0)
        res.cookie("errorMessage", "L'email existe déjà.", {
          httpOnly: false,
          maxAge: 10000,
        });
      return res.redirect("/register");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database, including "nom"
    const userResult = await client.query(
      "INSERT INTO users (nom, email, password) VALUES ($1, $2, $3) RETURNING id",
      [nom, email, hashedPassword],
    );

    const userId = userResult.rows[0].id; // Get the new user's id

    // Get the user's IP address
    const ipAddress = req.headers["x-forwarded-for"] || req.ip; // Use 'x-forwarded-for' for proxy support
    const currentDate = new Date();

    // Insert the IP record for this user
    await client.query(
      "INSERT INTO ip (user_id, access_date, access_time, ip_address) VALUES ($1, $2, $3, $4)",
      [
        userId,
        currentDate.toISOString().split("T")[0], // Get the current date in 'YYYY-MM-DD' format
        currentDate.toISOString().split("T")[1].split(".")[0], // Get the current time in 'HH:MM:SS' format
        ipAddress,
      ],
    );

    // Generate JWT token
    const token = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: "24h" });

    // Set cookie
    // res.cookie("token", token, { httpOnly: true });
    res.cookie("successMessage", "Compte créé avec succès !", {
      httpOnly: false,
      maxAge: 10000,
    }); // 10 secondes
    res.redirect("/login");
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

  let client;

  try {
    client = await pool.connect();

    // Check if the email exists
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      res.cookie(
        "errorMessage",
        "L'adresse e-mail et le mot de passe saisis ne correspondent pas.",
        { httpOnly: false, maxAge: 10000 },
      );
      return res.redirect("/login");
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.cookie(
        "errorMessage",
        "L'adresse e-mail et le mot de passe saisis ne correspondent pas.",
        { httpOnly: false, maxAge: 10000 },
      );
      return res.redirect("/login");
    }

    // Log the IP address, date, and time of login
    const ipAddress = req.headers["x-forwarded-for"] || req.ip; // Use 'x-forwarded-for' for proxy support
    const currentDate = new Date();

    // Insert the IP record for this user
    await client.query(
      "INSERT INTO ip (user_id, access_date, access_time, ip_address) VALUES ($1, $2, $3, $4)",
      [
        user.id,
        currentDate.toISOString().split("T")[0], // Current date in 'YYYY-MM-DD' format
        currentDate.toISOString().split("T")[1].split(".")[0], // Current time in 'HH:MM:SS' format
        ipAddress,
      ],
    );

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set cookie with the token
    res.cookie("token", token, { httpOnly: true });

    // res.status(200).json({ token });
    res.redirect("/dashboard");
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

app.get("/api/logout", (req, res) => {
  // Clear the "token" cookie by setting it to an empty value and an expired date
  res.clearCookie("token", { httpOnly: true, sameSite: "Strict" });

  res.redirect("/homepage");

  // res.status(200).json({ message: "User logged out successfully" });
});

// Protected route to get user details
app.get("/api/user", async (req, res) => {
  const token = req.cookies.token; // Get token from cookies

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  let client; // Declare the client variable

  // Connect to the database
  client = await pool.connect();

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    // Fetch user details using the decoded token's email
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      userEmail,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // Release the client back to the pool if it's defined
  }

  if (client) {
    client.release();
  }
});

app.put("/api/user/update", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    const { firstname, lastname, email } = req.body;

    // Valider que les champs sont bien présents
    if (!firstname || !lastname || !email) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const client = await pool.connect();

    // Mettre à jour les données de l'utilisateur
    await client.query(
      `UPDATE users SET nom = $1, email = $2 WHERE email = $3`,
      [firstname + " " + lastname, email, userEmail],
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Middleware to get user from JWT token in cookies
async function getUserFromToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    const client = await pool.connect();
    const userResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [userEmail],
    );
    const user = userResult.rows[0];
    client.release();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.userId = user.id; // Attach the user ID to the request
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// New Route: Get all transactions for the user as CSV
app.get("/api/transaction/account/csv", getUserFromToken, async (req, res) => {
  const userId = req.userId; // Get the userId from the token
  const accountId = req.query.accountId; // Get accountId from the query parameters

  // Check if accountId is provided in the query
  if (!accountId) {
    return res.status(400).json({ error: "Account ID is required" });
  }

  try {
    const client = await pool.connect();

    // Verify that the account belongs to the user
    const accountResult = await client.query(
      "SELECT id FROM accounts WHERE id = $1 AND userId = $2",
      [accountId, userId],
    );

    // If no account is found for the user with the specified accountId, return an error
    if (accountResult.rows.length === 0) {
      client.release();
      return res
        .status(404)
        .json({ error: "Account not found or does not belong to user" });
    }

    // Query to find all transactions for the specified account
    const transactionsResult = await client.query(
      "SELECT t.id, t.type, t.amount, t.balance, t.accountId " +
      "FROM transactions t " +
      "WHERE t.accountId = ANY($1)",
      [accountIds],
    );

    client.release();

    const transactions = transactionsResult.rows;

    // If no transactions are found, return an empty CSV
    if (transactions.length === 0) {
      const emptyCSV = Papa.unparse([]); // Create an empty CSV
      res.header("Content-Type", "text/csv");
      res.attachment("transactions.csv");
      return res.send(emptyCSV); // Send empty CSV file
    }

    // Convert the data to CSV format using PapaParse
    const csv = Papa.unparse(transactions);

    // Set headers to indicate the response is CSV
    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv"); // Optional: Set the filename for download
    res.send(csv); // Send the CSV content as the response
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// API to add a new account
app.post("/api/account/add", getUserFromToken, async (req, res) => {
  const { name, type, lowSale, balance } = req.body;
  const userId = req.userId;

  if (!name || !type || lowSale === undefined || balance === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO accounts (name, type, lowSale, balance, userId) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, type, lowSale, balance, userId],
    );
    client.release();

    const newAccount = result.rows[0];
    return res
      .status(201)
      .json({ message: "Account created successfully", account: newAccount });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create account" });
  }
});

app.put("/api/account/update", getUserFromToken, async (req, res) => {
  const { id, name, type, lowSale, balance } = req.body;
  const userId = req.userId;

  if (!id || !name || !type || lowSale === undefined || balance === undefined) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  try {
    const client = await pool.connect();

    // Vérifiez que le compte appartient bien à l'utilisateur
    const accountResult = await client.query(
      "SELECT id FROM accounts WHERE id = $1 AND userId = $2",
      [id, userId]
    );

    if (accountResult.rowCount === 0) {
      return res.status(404).json({ error: "Compte introuvable ou non autorisé" });
    }

    // Mettre à jour le compte
    await client.query(
      "UPDATE accounts SET name = $1, type = $2, lowSale = $3, balance = $4 WHERE id = $5",
      [name, type, lowSale, balance, id]
    );

    client.release();
    return res.status(200).json({ message: "Compte mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du compte:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// API to remove an account
app.post("/api/accounts/delete", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    const client = await pool.connect();
    try {
      // Get the user ID from the email in the decoded token
      const userResult = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [userEmail],
      );
      const user = userResult.rows[0];
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if accountId is provided in the body
      const { accountId } = req.body;

      if (!accountId) {
        return res.status(400).json({ error: "Account ID is required" });
      }

      // Check if the account exists and belongs to the user
      const accountResult = await client.query(
        "SELECT id FROM accounts WHERE id = $1 AND userId = $2",
        [accountId, user.id],
      );

      if (accountResult.rowCount === 0) {
        return res
          .status(404)
          .json({ error: "Account not found or does not belong to the user" });
      }

      // Delete the account
      await client.query("DELETE FROM accounts WHERE id = $1", [accountId]);

      res.status(200).json({ message: "Account deleted successfully" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the account" });
  }
});

app.get("/api/accounts/getAll", async (req, res) => {
  try {
    // Check for the token in cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    // Connect to the database
    const client = await pool.connect();
    try {
      // Get the user ID using the email from the decoded token
      const userResult = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [userEmail],
      );
      const user = userResult.rows[0];
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Retrieve the list of accounts for the user
      const accountsResult = await client.query(
        "SELECT id, name, type, lowSale, balance FROM accounts WHERE userId = $1",
        [user.id],
      );
      const accounts = accountsResult.rows;

      // Respond with the accounts data
      res.status(200).json({ accounts });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in /api/accounts:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    res
      .status(500)
      .json({ error: "An error occurred while retrieving accounts" });
  }
});

app.get("/api/accounts/getById", async (req, res) => {
  try {
    // Vérification du token dans les cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Vérification et décodage du token JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email;

    // Connexion à la base de données
    const client = await pool.connect();
    try {
      // Récupération de l'ID utilisateur via l'email du token décodé
      const userResult = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [userEmail],
      );
      const user = userResult.rows[0];
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Récupération de l'ID du compte depuis les paramètres de la requête
      const { accountId } = req.query; // `accountId` dans les paramètres de la requête

      if (!accountId) {
        return res.status(400).json({ error: "Account ID is required" });
      }

      // Récupération des informations du compte à partir de l'ID
      const accountResult = await client.query(
        "SELECT id, name, type, lowSale, balance FROM accounts WHERE userId = $1 AND id = $2",
        [user.id, accountId],
      );

      const account = accountResult.rows[0];
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      // Réponse avec les informations du compte
      res.status(200).json({ account });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in /api/accounts/getById:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the account" });
  }
});

// API to add a transaction
app.post("/api/transactions/add", async (req, res) => {
  const { type, amount, accountId } = req.body; // Get transaction data from the request body

  // Check if all necessary fields are provided
  if (!type || !amount || !accountId) {
    return res.status(400).json({ error: "Missing transaction data" });
  }

  // Check for the token in cookies
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET); // Use your JWT_SECRET
    const userEmail = decoded.email; // Assume the email was encoded in the token

    // Get the user ID using the email from the decoded token
    const client = await pool.connect();
    const userResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [userEmail],
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.id;

    // Validate if the account exists and belongs to the user
    const accountResult = await client.query(
      "SELECT id FROM accounts WHERE id = $1 AND userId = $2",
      [accountId, userId],
    );

    const account = accountResult.rows[0];
    if (!account) {
      return res
        .status(404)
        .json({ error: "Account not found or does not belong to the user" });
    }

    // Insert the transaction into the database
    const transactionResult = await client.query(
      "INSERT INTO transactions (type, amount, balance, accountId) " +
      "VALUES ($1, $2, (SELECT balance FROM accounts WHERE id = $3) + $2, $3) " +
      "RETURNING id, type, amount, balance, accountId",
      [type, amount, accountId],
    );

    const transaction = transactionResult.rows[0];

    // Update account balance (assuming transactions affect the balance)
    await client.query(
      "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
      [amount, accountId],
    );

    // Close the database connection
    client.release();

    // Return the newly created transaction
    return res.status(201).json({ transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// API to get all transactions for the user
app.post("/api/transactions/getAll", async (req, res) => {
  let client; // Declare the client variable here
  try {
    // Check for the token in cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userEmail = decoded.email; // Extract the email from the token

    // Establish a connection to the database
    client = await pool.connect();

    // Get the user ID using the email from the decoded token
    const userResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [userEmail],
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.id;

    // Extract accountId from the request body
    const { accountId } = req.body;
    if (!accountId) {
      return res.status(400).json({ error: "Account ID is required" });
    }

    // Fetch transactions for the specific account ID and user ID
    const transactionQuery = `
      SELECT t.id, t.type, t.amount, t.balance, t.accountid, a.name as account_name, t.transaction_date as transaction_date
      FROM transactions t
      JOIN accounts a ON a.id = t.accountid
      WHERE a.userid = $1 AND t.accountid = $2
    `;
    const transactionResult = await client.query(transactionQuery, [
      userId,
      accountId,
    ]);

    // If no transactions found
    if (transactionResult.rows.length === 0) {
      return res.status(200).json({ transactions: [] }); // Returning an empty array
    }

    // Return the transactions
    return res.json({ transactions: transactionResult.rows });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    // Release the client only if it was successfully connected
    if (client) {
      client.release();
    }
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
