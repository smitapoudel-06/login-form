import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middlewares
// Enable CORS for cross-origin requests (allows our frontend to communicate with this backend)
app.use(cors());
// Parse incoming JSON requests and put the parsed data in req.body
app.use(express.json());
// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Trusted Marketplace API is running smoothly',
  });
});

// Handling 404 routes (Route not found)
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
