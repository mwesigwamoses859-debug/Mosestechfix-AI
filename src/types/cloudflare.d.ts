declare module 'cloudflare:workers' {
  export const env: any;
}

declare module 'cloudflare:node' {
  export function httpServerHandler(options: { port: number }): any;
}
