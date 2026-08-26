export const prisma = new Proxy({}, { get: () => new Proxy({}, { get: () => () => null }) }) as any;
