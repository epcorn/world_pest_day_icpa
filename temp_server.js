const express = require("express");
const path = require('path');

const app = express();

// Serve static files from the React client's 'build' folder.
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route to serve the React app's index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000; // Use a default port for now

app.listen(PORT, () => console.log(`🚀 Test server running on port ${PORT}`));