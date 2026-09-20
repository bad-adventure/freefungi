export const config = {
  port: Number(process.env.PORT || 3000),
  // Bind to loopback unless explicitly told otherwise.
  host: process.env.FF_HOST || '127.0.0.1',
};
