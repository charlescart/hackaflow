const express = require('express');
const { urlencoded, json } = require('body-parser');
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');
// const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
// const logger = require('./config/logger');
const handleError = require('./middlewares/error.middleware');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

const port = process.env.PORT;
const app = express();
app.use(cors());

const server = http.createServer(app);

app.use(limiter);

app.use(urlencoded({ extended: true }));
app.use(json());
// app.use(morgan('combined', { stream: logger.stream }));

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/index.html`));
});

const io = socketIO(server, {
  cors: {
    origin: '*',
  },
});

/* features */
require('./features/hackaflow/hackaflow.socket.js')(app, io);
require('./features/hackaflow/hackaflow.router')(app, io);

app.use((err, req, res, next) => {
  handleError(err, res, req);
});

server.listen(port, () => {
  // logger.info(`We are live on ${port}`);

  // eslint-disable-next-line no-console
  console.info(`We are live on ${port}`);
});
