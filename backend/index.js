const express = require('express');
const cors = require('cors');
require('dotenv').config();

const classifyRoute = require('./classifyRoute');

const app = express();

app.use(cors());
app.use(express.json());  // <-- Must be here clearly to parse JSON body

app.use('/api', classifyRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
