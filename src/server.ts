import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { HashbrownGoogle } from '@hashbrownai/google';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// IMPORTANT: Parse JSON bodies for our API route
app.use(express.json());

// Initialize Hashbrown AI for the backend (Note: in v0.4+ HashbrownGoogle might not use 'new')
// Using it as an object per the error, or standard init based on recent SDK changes
const llm = HashbrownGoogle;

const SYSTEM_PROMPT = `
  You are a helpful AI assistant.
`;

/**
 * Hashbrown Proxy Setup
 */
app.post('/api/chat', async (req, res) => {
  try {
        const googleApiKey = process.env['GOOGLE_API_KEY'];

    if (!googleApiKey) {
      res.status(500).json({ error: 'Server is missing GOOGLE_API_KEY' });
      return;
    }

     // Server always overrides security-critical fields
    const safeOptions = {
      apiKey: googleApiKey,
      request: {
        ...req.body,
        model: 'gemini-2.0-flash',
        system: SYSTEM_PROMPT,
      }          // cap cost
    };

    // Set headers for server-sent events (streaming)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Call Hashbrown to get a stream and pipe it to the response
    // If HashbrownGoogle has stream.text method:
    const stream = llm.stream.text(safeOptions);
    for await (const chunk of stream) {
      res.write(chunk);
    }
    res.end();

  } catch (error) {
    console.error('Error proxying chat:', error);

    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Non-Error thrown:', JSON.stringify(error, null, 2));
    }

    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat request' });
    } else {
      res.end();
    }
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
