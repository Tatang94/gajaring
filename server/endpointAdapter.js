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
    
    // More comprehensive TypeScript to JavaScript conversion
    let jsContent = tsContent
      // Remove all TypeScript import type statements first
      .replace(/import\s+type\s+\{[^}]*\}\s+from\s+[^;]+;?\s*/g, '')
      .replace(/import\s+type\s+[^;]+;?\s*/g, '')
      
      // Handle mixed imports with type keyword
      .replace(/import\s*\{\s*([^}]*?),\s*type\s+[^}]*\}\s*from\s*([^;]+);?/g, 'import { $1 } from $2;')
      .replace(/import\s*\{\s*type\s+[^,}]*,\s*([^}]*?)\}\s*from\s*([^;]+);?/g, 'import { $1 } from $2;')
      .replace(/import\s*\{\s*([^,}]*?),\s*type\s+[^}]*,\s*([^}]*?)\}\s*from\s*([^;]+);?/g, 'import { $1, $2 } from $3;')
      
      // Remove type keyword from imports
      .replace(/import\s*\{\s*type\s+([^}]+)\s*\}\s*from\s*([^;]+);?/g, '')
      .replace(/,\s*type\s+[^,}]+/g, '')
      .replace(/type\s+([^,}]+),/g, '')
      
      // Remove TypeScript type annotations and interfaces
      .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
      .replace(/:\s*\w+(\[\])?(\s*\|\s*\w+(\[\])?)*(?=\s*[,)=;])/g, '')
      .replace(/:\s*Promise<[^>]+>/g, '')
      .replace(/:\s*Request/g, '')
      .replace(/:\s*Response/g, '')
      .replace(/as\s+\w+/g, '')
      .replace(/<[^>]+>/g, '') // Remove generic type parameters
      
      // Handle import statements - convert all .ts/.tsx extensions to .js
      .replace(/from\s+['"]([^'"]+)\.tsx?['"];?/g, (match, path) => {
        return match.replace(/\.tsx?/, '.js');
      })
      
      // Handle relative imports without extensions - add .js
      .replace(/from\s+['"](\.[^'"]*?)['"];?/g, (match, path) => {
        if (!path.includes('.')) {
          return match.replace(path, path + '.js');
        }
        return match;
      })
      
      // Convert export function to regular function for dynamic import
      .replace(/export\s+async\s+function\s+handle/g, 'async function handle')
      
      // Clean up any remaining type-related syntax
      .replace(/export\s+type\s+[^;]+;/g, '')
      .replace(/export\s+interface\s+\w+\s*\{[^}]*\}/g, '')
      
      // Add export at the end
      .replace(/$/, '\n\nexport { handle };');

    // Create a temporary file to execute
    const tempPath = join(__dirname, `temp_endpoint_${Date.now()}.js`);
    await fs.writeFile(tempPath, jsContent);

    try {
      // Import with cache busting
      const module = await import(`file://${tempPath}?t=${Date.now()}`);
      
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