import { config } from './config';
import app from './app';
import { connectMongo } from './db';

async function main() {
  await connectMongo();
  app.listen(config.port, () => {
    console.log(`CouponX backend listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});


