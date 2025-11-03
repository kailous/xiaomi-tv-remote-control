const app = require('../app');

// When run directly (e.g. via `npm start`) boot up the HTTP server.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

// Export the Express app so that serverless platforms (like Vercel) can handle requests.
module.exports = app;
