import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

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

    // Import the TypeScript endpoint file directly (ts-node will handle compilation)
    const module = await import(`file://${fullPath}?t=${Date.now()}`);
    
    if (typeof module.handle === 'function') {
      // Create a Web API Request object from Express req
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const webRequest = new Request(url, {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
      });

      // Call the endpoint handler with Web API Request
      const webResponse = await module.handle(webRequest);
      
      if (webResponse && webResponse instanceof Response) {
        // Set status
        res.status(webResponse.status || 200);
        
        // Set headers
        webResponse.headers.forEach((value, key) => {
          res.set(key, value);
        });
        
        // Send response body
        const responseText = await webResponse.text();
        res.send(responseText);
      } else {
        res.status(500).json({ error: 'Invalid response from endpoint' });
      }
    } else {
      res.status(500).json({ error: 'No handle function found' });
    }
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