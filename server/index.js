/**
 * FileName: index.js
 * Author: Wai Lok Daniel Tam
 * Description: Main file for setting up the server.
 */

// Imports
import express from 'express';

// Variables
const app = express();
const port = 8080;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});