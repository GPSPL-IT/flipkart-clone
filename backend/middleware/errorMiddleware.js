// Global error handlers — must be the LAST middleware in Express

// @desc  404 handler — triggered when no route matched
const notFound = (req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// @desc  Global error handler — catches all errors passed via next(error)
const errorHandler = (err, req, res, next) => {
  // Express sometimes passes 200 even when there is an error — normalise it
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message,
    // Only expose the stack trace during development (never in production)
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
