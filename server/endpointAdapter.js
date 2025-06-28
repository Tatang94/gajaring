// Adapter to handle TypeScript endpoint files in Node.js
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function adaptEndpoint(endpointPath, req, res) {
  try {
    // Convert TypeScript endpoint to JavaScript equivalent
    const tsContent = await fs.readFile(endpointPath, 'utf-8');
    
    // Simple TypeScript to JavaScript conversion
    let jsContent = tsContent
      .replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/g, (match, imports, path) => {
        // Convert relative imports
        if (path.startsWith('./') || path.startsWith('../')) {
          const resolvedPath = join(dirname(endpointPath), path);
          return `const { ${imports} } = await import('${resolvedPath}.js');`;
        }
        return `const { ${imports} } = await import('${path}');`;
      })
      .replace(/export\s+async\s+function\s+handle/g, 'async function handle')
      .replace(/: Request/g, '')
      .replace(/: Response/g, '')
      .replace(/: Promise<Response>/g, '');

    // Create a temporary file to execute
    const tempPath = join(__dirname, 'temp_endpoint.js');
    await fs.writeFile(tempPath, jsContent);

    try {
      const module = await import(`file://${tempPath}`);
      
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
    } finally {
      // Clean up temp file
      try {
        await fs.unlink(tempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    console.error('Endpoint adaptation error:', error);
    res.status(500).json({ 
      error: 'Failed to process endpoint',
      message: error.message 
    });
  }
}