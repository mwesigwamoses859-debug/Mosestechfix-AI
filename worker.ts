import { env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import app from './server';

// Cloudflare bindings and environment variables
(app as any).locals.runtimeEnv = env;
app.listen(3000);

export default httpServerHandler({ port: 3000 });
