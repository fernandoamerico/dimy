// src/core/db.ts
// Smarter mock proxy for Prisma to prevent runtime crashes in the browser.
// Because the frontend is compiled statically and served by Go, Prisma cannot run client-side.

const emptyArrayFunc = () => Promise.resolve([]);
const emptyObjectFunc = () => Promise.resolve({});
const countFunc = () => Promise.resolve(0);

const prismaMock = new Proxy({}, {
  get: (target, prop) => {
    return new Proxy({}, {
      get: (modelTarget, modelProp) => {
        if (modelProp === 'findMany') {
          return emptyArrayFunc;
        }
        if (modelProp === 'count') {
          return countFunc;
        }
        if (modelProp === 'findUnique' || modelProp === 'findFirst' || modelProp === 'create' || modelProp === 'update' || modelProp === 'delete' || modelProp === 'upsert') {
          return () => Promise.resolve(null);
        }
        return () => Promise.resolve(null);
      }
    });
  }
});

export const prisma = prismaMock as any;
