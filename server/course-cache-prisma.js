const { AsyncLocalStorage } = require('node:async_hooks');
const writes = new Set(['create', 'createMany', 'createManyAndReturn', 'update', 'updateMany', 'updateManyAndReturn', 'upsert', 'delete', 'deleteMany']);

function withCourseInvalidation(base, invalidate) {
  const transactions = new AsyncLocalStorage();
  const invalidateSafely = async () => { try { await invalidate(); } catch { /* Redis is optional. */ } };
  const client = base.$extends({
    name: 'public-course-cache-invalidation',
    query: { courses: {
      async $allOperations({ operation, args, query }) {
        const result = await query(args);
        if (writes.has(operation)) {
          const state = transactions.getStore();
          if (state) state.changed = true;
          else await invalidateSafely(); // Autocommit has completed.
        }
        return result;
      },
    } },
  });
  return new Proxy(client, {
    get(target, property) {
      if (property === '$transaction') return async (input, options) => {
        const state = { changed: false };
        const result = await transactions.run(state, () => target.$transaction(input, options));
        // Invalidate after COMMIT, never on an uncommitted or rolled-back write.
        if (state.changed) await invalidateSafely();
        return result;
      };
      return Reflect.get(target, property);
    },
  });
}
module.exports = { withCourseInvalidation };
