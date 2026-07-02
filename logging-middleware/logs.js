const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs.txt');

function loggingMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const timeTaken = Date.now() - startTime;
    const logMessage = `${new Date().toISOString()} | ${req.method} | ${req.originalUrl || req.url} | ${res.statusCode} | ${timeTaken}ms\n`;

    fs.appendFile(logFilePath, logMessage, (error) => {
      if (error) {
        
      }
    });
  });

  next();
}

module.exports = loggingMiddleware;
