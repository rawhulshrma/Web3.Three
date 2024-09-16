const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv");
const pool = require('./config/db'); // Ensure this path is correct
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// App setup
const app = express();
const server = http.createServer(app);

dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: `Server is running on port ${PORT}`, environment: process.env.NODE_ENV });
});

// Initialize database tables
const initializeTables = async () => {
  try {
    // Uncomment and modify these lines based on your actual model and database schema
    // await UserModel.createUserTable();
    // await peopleModels.createPeopleTable();
    // await adminModel.createAdminTable();
    // await productCategoryModel.createProductCategoryTable();
    // await productModel.createProductsTable();
    // await branchModel.createBranchTable();
    console.log('Database Tables Initialized Successfully');
  } catch (err) {
    console.error('Error Initializing Tables:', err.message);
    process.exit(1);
  }
};

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Error handling for 404 routes
app.use('*', (req, res) => {
  res.status(404).send('Not Found');
});

const startServer = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log(`Database connection successful ${result.rows[0].now}`);
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});

// Start initialization and server
initializeTables().then(startServer);

module.exports = app;