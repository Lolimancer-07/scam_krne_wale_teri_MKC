import pino from 'pino';

// PII scrubbing for logs
const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'body.password',
  'body.otp',
  'body.pin',
  'body.cvv',
];

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: redactPaths,
    censor: '[REDACTED_PII]',
  },
});
