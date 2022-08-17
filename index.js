const express = require('express');
const dontenv = require('dotenv');
const app = express();
const mainRoute = require('./routes/main');

dontenv.config();
app.use(express.json());

//Set up default mongoose connection

app.use('/api', mainRoute);

// express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BACKEND SERVER RUNNING ON ${PORT}...`);
});
