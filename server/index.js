import express from 'express';  
import fetch from './fetch.js'
const app = express();
const PORT = 3000;

// Middleware for JSON
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Server is running ✅');
});

// Example API route
app.get('/api/movies', async(req, res) => {

    const array = await fetch();

    res.json([
        ...array
    ]);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});