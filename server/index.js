import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { adaptEndpoint } from './endpointAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());

// Function to dynamically import and handle endpoint files
async function handleEndpoint(req, res, endpointPath) {
  try {
    const fullPath = join(__dirname, '..', endpointPath);
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch (error) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }

    // Use the adapter to handle TypeScript endpoint files
    await adaptEndpoint(fullPath, req, res);
  } catch (error) {
    console.error('Endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// API route handler
app.all('/_api/*', async (req, res) => {
  const apiPath = req.path.replace('/_api/', '');
  const method = req.method.toUpperCase();
  
  // Convert API path to endpoint file path
  let endpointPath;
  
  if (method === 'GET') {
    endpointPath = `endpoints/${apiPath}_GET.ts`;
  } else if (method === 'POST') {
    endpointPath = `endpoints/${apiPath}_POST.ts`;
  } else if (method === 'PUT') {
    endpointPath = `endpoints/${apiPath}_PUT.ts`;
  } else if (method === 'DELETE') {
    endpointPath = `endpoints/${apiPath}_DELETE.ts`;
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  await handleEndpoint(req, res, endpointPath);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from http://localhost:5000`);
});