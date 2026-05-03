const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Sometimes an error comes in with a 200 status code, this makes sure it's at least a 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  console.error('🛑 ERROR:', err.message);
  console.error(process.env.NODE_ENV === 'production' ? '📦' : err.stack);

  res.json({
    message: err.message,
    // We only want the stack trace if we're not in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
