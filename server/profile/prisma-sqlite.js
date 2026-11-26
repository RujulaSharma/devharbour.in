const crypto = require("node:crypto");

const MODELS = {
  developerProfile: {
    table: "developer_profiles",
    pk: ["userId"],
    cols: {
      userId: "user_id",
      headline: "headline",
      college: "college",
      company: "company",
      title: "title",
      city: "city",
      state: "state",
      country: "country",
      cover: "cover",
      visibility: "visibility",
      discovery: "discovery",
      recruitment: "recruitment",
      details: "details",
      privacy: "privacy",
      links: "links",
      pins: "pins",
      version: "version",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    booleans: new Set(["discovery", "recruitment"]),
    jsons: new Set(["details", "privacy", "links", "pins"]),
    dates: new Set(["createdAt", "updatedAt"]),
    defaults: () => ({
      headline: "",
      college: "",
      company: "",
      title: "",
      city: "",
      state: "",
      country: "",
      cover: "lavender",
      visibility: "private",
      discovery: false,
      recruitment: false,
      details: {},
      privacy: {},
      links: {},
      pins: {},
      version: 1,
    }),
  },
  profileEntry: {
    table: "profile_entries",
    pk: ["id"],
    cols: {
      id: "id",
      userId: "user_id",
      kind: "kind",
      data: "data",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    booleans: new Set(),
    jsons: new Set(["data"]),
    dates: new Set(["createdAt", "updatedAt"]),
    defaults: () => ({ data: {} }),
  },
  profileSkill: {
    table: "profile_skills",
    pk: ["id"],
    cols: {
      id: "id",
      userId: "user_id",
      name: "name",
      category: "category",
      proficiency: "proficiency",
      pinned: "pinned",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    booleans: new Set(["pinned"]),
    jsons: new Set(),
    dates: new Set(["createdAt", "updatedAt"]),
    defaults: () => ({ proficiency: "Beginner", pinned: false }),
  },
  profileActivity: {
    table: "profile_activity",
    pk: ["id"],
    cols: {
      id: "id",
      userId: "user_id",
      eventKey: "event_key",
      type: "type",
      title: "title",
      reference: "reference",
      occurredAt: "occurred_at",
    },
    booleans: new Set(),
    jsons: new Set(),
    dates: new Set(["occurredAt"]),
    defaults: () => ({ reference: null }),
  },
  profileGoal: {
    table: "profile_goals",
    pk: ["id"],
    cols: {
      id: "id",
      userId: "user_id",
      title: "title",
      metric: "metric",
      target: "target",
      baseline: "baseline",
      deadline: "deadline",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    booleans: new Set(),
    jsons: new Set(),
    dates: new Set(["deadline", "createdAt", "updatedAt"]),
    defaults: () => ({ baseline: 0, deadline: null }),
  },
  profileMedia: {
    table: "profile_media",
    pk: ["id"],
    cols: {
      id: "id",
      userId: "user_id",
      kind: "kind",
      objectPath: "object_path",
      mime: "mime",
      bytes: "bytes",
      label: "label",
      createdAt: "created_at",
    },
    booleans: new Set(),
    jsons: new Set(),
    dates: new Set(["createdAt"]),
    defaults: () => ({}),
  },
  profileConnection: {
    table: "profile_connections",
    pk: ["id"],
    cols: {
      id: "id",
      fromId: "from_id",
      toId: "to_id",
      kind: "kind",
      status: "status",
      message: "message",
      createdAt: "created_at",
    },
    booleans: new Set(),
    jsons: new Set(),
    dates: new Set(["createdAt"]),
    defaults: () => ({ status: "pending", message: "" }),
  },
  profileNotification: {
    table: "profile_notifications",
    pk: ["id"],
    cols: {
      id: "id",
      userId: "user_id",
      eventKey: "event_key",
      title: "title",
      read: "read",
      createdAt: "created_at",
    },
    booleans: new Set(["read"]),
    jsons: new Set(),
    dates: new Set(["createdAt"]),
    defaults: () => ({ read: false }),
  },
};

function parseDateVal(val) {
  if (val == null || val === "") return null;
  if (val instanceof Date) return val;
  const iso = typeof val === "string" && !val.includes("T") && /^\d{4}-\d{2}-\d{2} /.test(val)
    ? val.replace(" ", "T") + "Z"
    : val;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function hydrateRow(model, row) {
  if (!row) return null;
  const out = {};
  for (const [field, col] of Object.entries(model.cols)) {
    const raw = row[col];
    if (model.booleans.has(field)) {
      out[field] = Boolean(raw);
    } else if (model.jsons.has(field)) {
      try {
        out[field] = typeof raw === "string" ? JSON.parse(raw || "{}") : (raw || {});
      } catch {
        out[field] = {};
      }
    } else if (model.dates.has(field)) {
      out[field] = parseDateVal(raw);
    } else {
      out[field] = raw;
    }
  }
  return out;
}

function serializeValue(model, field, val) {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (model.booleans.has(field)) return val ? 1 : 0;
  if (model.jsons.has(field)) return typeof val === "string" ? val : JSON.stringify(val ?? {});
  if (model.dates.has(field)) return val instanceof Date ? val.toISOString() : String(val);
  return val;
}

function loadUserMini(sqlite, id) {
  if (!id) return null;
  const u = sqlite.prepare("SELECT id, username, full_name, avatar_url, bio, location FROM users WHERE id = ?").get(id);
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    fullName: u.full_name,
    avatarUrl: u.avatar_url || "",
    bio: u.bio || "",
    location: u.location || "",
  };
}

function matchScalarCondition(val, cond) {
  if (cond === undefined) return true;
  if (cond === null) return val === null || val === undefined;
  if (typeof cond !== "object" || cond instanceof Date) {
    if (val instanceof Date && cond instanceof Date) return val.getTime() === cond.getTime();
    return val === cond;
  }
  if (Array.isArray(cond.in)) return cond.in.includes(val);
  if (Array.isArray(cond.notIn)) return !cond.notIn.includes(val);
  if (cond.contains !== undefined) {
    const s = String(val ?? "");
    const q = String(cond.contains);
    return cond.mode === "insensitive" ? s.toLowerCase().includes(q.toLowerCase()) : s.includes(q);
  }
  if (cond.startsWith !== undefined) {
    const s = String(val ?? "");
    const q = String(cond.startsWith);
    return cond.mode === "insensitive" ? s.toLowerCase().startsWith(q.toLowerCase()) : s.startsWith(q);
  }
  if (cond.lt !== undefined && !(val < cond.lt)) return false;
  if (cond.lte !== undefined && !(val <= cond.lte)) return false;
  if (cond.gt !== undefined && !(val > cond.gt)) return false;
  if (cond.gte !== undefined && !(val >= cond.gte)) return false;
  if (cond.not !== undefined && matchScalarCondition(val, cond.not)) return false;
  return true;
}

function expandWhere(where) {
  if (!where) return {};
  const out = {};
  for (const [k, val] of Object.entries(where)) {
    if (k === "fromId_toId_kind" && val && typeof val === "object") {
      out.fromId = val.fromId;
      out.toId = val.toId;
      out.kind = val.kind;
    } else if (k === "userId_eventKey" && val && typeof val === "object") {
      out.userId = val.userId;
      out.eventKey = val.eventKey;
    } else if (k === "userId_name" && val && typeof val === "object") {
      out.userId = val.userId;
      out.name = val.name;
    } else {
      out[k] = val;
    }
  }
  return out;
}

function matchUserFilter(sqlite, userId, cond) {
  const user = loadUserMini(sqlite, userId);
  if (!user) return false;
  const sub = cond?.is ? cond.is : cond;
  return matchWhere(sqlite, user, sub || {}, null);
}

function matchWhere(sqlite, record, where, modelName) {
  if (!where) return true;
  const w = expandWhere(where);
  for (const [k, cond] of Object.entries(w)) {
    if (k === "OR" && Array.isArray(cond)) {
      if (!cond.some((sub) => matchWhere(sqlite, record, sub, modelName))) return false;
      continue;
    }
    if (k === "AND") {
      const list = Array.isArray(cond) ? cond : [cond];
      if (!list.every((sub) => matchWhere(sqlite, record, sub, modelName))) return false;
      continue;
    }
    if (k === "NOT") {
      const list = Array.isArray(cond) ? cond : [cond];
      if (list.some((sub) => matchWhere(sqlite, record, sub, modelName))) return false;
      continue;
    }
    if (k === "user" && cond && typeof cond === "object") {
      if (!matchUserFilter(sqlite, record.userId, cond)) return false;
      continue;
    }
    if (!matchScalarCondition(record[k], cond)) return false;
  }
  return true;
}

function sortRecords(records, orderBy) {
  if (!orderBy) return records;
  const specs = Array.isArray(orderBy) ? orderBy : [orderBy];
  const copy = [...records];
  copy.sort((a, b) => {
    for (const spec of specs) {
      for (const [field, dir] of Object.entries(spec)) {
        const av = a[field] instanceof Date ? a[field].getTime() : a[field];
        const bv = b[field] instanceof Date ? b[field].getTime() : b[field];
        if (av === bv) continue;
        if (av == null) return dir === "desc" ? 1 : -1;
        if (bv == null) return dir === "desc" ? -1 : 1;
        return (av < bv ? -1 : 1) * (dir === "desc" ? -1 : 1);
      }
    }
    return 0;
  });
  return copy;
}

function projectRecord(sqlite, record, select) {
  if (!select) return record;
  const out = {};
  for (const [key, spec] of Object.entries(select)) {
    if (!spec) continue;
    if (key === "user" || key === "from" || key === "to") {
      const uid = key === "user" ? record.userId : key === "from" ? record.fromId : record.toId;
      const related = loadUserMini(sqlite, uid);
      out[key] = related && spec.select ? projectRecord(sqlite, related, spec.select) : related;
    } else {
      out[key] = record[key];
    }
  }
  return out;
}

function createModelDelegate(getSqlite, modelName) {
  const model = MODELS[modelName];
  const allRows = () =>
    getSqlite()
      .prepare(`SELECT * FROM ${model.table}`)
      .all()
      .map((r) => hydrateRow(model, r));

  const applyData = (record, data, isCreate = false) => {
    const now = new Date().toISOString();
    const base = isCreate ? { ...model.defaults() } : { ...record };
    if (isCreate && model.cols.id && !data.id) base.id = crypto.randomUUID();
    if (isCreate && model.cols.createdAt) base.createdAt = parseDateVal(now);
    if (model.cols.updatedAt) base.updatedAt = parseDateVal(now);
    for (const [field, val] of Object.entries(data || {})) {
      if (!(field in model.cols)) continue;
      if (val && typeof val === "object" && "increment" in val) {
        base[field] = Number(base[field] || 0) + Number(val.increment || 0);
      } else if (val && typeof val === "object" && "decrement" in val) {
        base[field] = Number(base[field] || 0) - Number(val.decrement || 0);
      } else {
        base[field] = model.dates.has(field) ? parseDateVal(val) : val;
      }
    }
    return base;
  };

  const insertRecord = (rec) => {
    const sqlite = getSqlite();
    const fields = Object.keys(model.cols).filter((f) => rec[f] !== undefined);
    const colNames = fields.map((f) => model.cols[f]).join(", ");
    const placeholders = fields.map(() => "?").join(", ");
    const values = fields.map((f) => serializeValue(model, f, rec[f]));
    sqlite.prepare(`INSERT INTO ${model.table} (${colNames}) VALUES (${placeholders})`).run(...values);
    return hydrateRow(
      model,
      sqlite.prepare(`SELECT * FROM ${model.table} WHERE ${model.cols[model.pk[0]]} = ?`).get(rec[model.pk[0]]),
    );
  };

  const updateRecord = (existing, patch) => {
    const sqlite = getSqlite();
    const next = applyData(existing, patch, false);
    const fields = Object.keys(model.cols).filter((f) => !model.pk.includes(f) && next[f] !== undefined);
    const sets = fields.map((f) => `${model.cols[f]} = ?`).join(", ");
    const pkField = model.pk[0];
    const values = [...fields.map((f) => serializeValue(model, f, next[f])), existing[pkField]];
    sqlite.prepare(`UPDATE ${model.table} SET ${sets} WHERE ${model.cols[pkField]} = ?`).run(...values);
    return hydrateRow(
      model,
      sqlite.prepare(`SELECT * FROM ${model.table} WHERE ${model.cols[pkField]} = ?`).get(existing[pkField]),
    );
  };

  const api = {
    async findMany(args = {}) {
      const sqlite = getSqlite();
      let list = allRows().filter((r) => matchWhere(sqlite, r, args.where, modelName));
      list = sortRecords(list, args.orderBy);
      if (args.skip) list = list.slice(Number(args.skip));
      if (args.take != null) list = list.slice(0, Number(args.take));
      return args.select ? list.map((r) => projectRecord(sqlite, r, args.select)) : list;
    },
    async findFirst(args = {}) {
      const rows = await api.findMany({ ...args, take: 1 });
      return rows[0] || null;
    },
    async findUnique(args = {}) {
      return api.findFirst(args);
    },
    async count(args = {}) {
      const sqlite = getSqlite();
      return allRows().filter((r) => matchWhere(sqlite, r, args.where, modelName)).length;
    },
    async create({ data, select }) {
      const rec = applyData(null, data, true);
      const inserted = insertRecord(rec);
      return select ? projectRecord(getSqlite(), inserted, select) : inserted;
    },
    async update({ where, data, select }) {
      const existing = await api.findFirst({ where });
      if (!existing) throw Object.assign(new Error("Record not found"), { code: "P2025", status: 404 });
      const updated = updateRecord(existing, data);
      return select ? projectRecord(getSqlite(), updated, select) : updated;
    },
    async updateMany({ where, data }) {
      const sqlite = getSqlite();
      const matches = allRows().filter((r) => matchWhere(sqlite, r, where, modelName));
      for (const row of matches) updateRecord(row, data);
      return { count: matches.length };
    },
    async deleteMany({ where }) {
      const sqlite = getSqlite();
      const matches = allRows().filter((r) => matchWhere(sqlite, r, where, modelName));
      const pkCol = model.cols[model.pk[0]];
      const stmt = sqlite.prepare(`DELETE FROM ${model.table} WHERE ${pkCol} = ?`);
      for (const row of matches) stmt.run(row[model.pk[0]]);
      return { count: matches.length };
    },
    async upsert({ where, create, update, select }) {
      const existing = await api.findFirst({ where });
      const saved = existing ? updateRecord(existing, update) : insertRecord(applyData(null, create, true));
      return select ? projectRecord(getSqlite(), saved, select) : saved;
    },
    async groupBy({ by = [], where, _count }) {
      const sqlite = getSqlite();
      const matches = allRows().filter((r) => matchWhere(sqlite, r, where, modelName));
      const groups = new Map();
      for (const row of matches) {
        const key = JSON.stringify(by.map((f) => row[f]));
        if (!groups.has(key)) {
          const item = {};
          for (const f of by) item[f] = row[f];
          item.__rows = [];
          groups.set(key, item);
        }
        groups.get(key).__rows.push(row);
      }
      const out = [];
      for (const grp of groups.values()) {
        const rows = grp.__rows;
        delete grp.__rows;
        if (_count && typeof _count === "object") {
          grp._count = {};
          for (const [k, v] of Object.entries(_count)) {
            if (v) grp._count[k] = k === "_all" ? rows.length : rows.filter((r) => r[k] != null).length;
          }
        }
        out.push(grp);
      }
      return out;
    },
  };
  return api;
}

function bindDollarParams(sql, params) {
  const ordered = [];
  const converted = sql.replace(/('(?:''|[^'])*')|\$(\d+)/g, (match, quoted, idx) => {
    if (quoted) return quoted;
    const pos = Number(idx) - 1;
    ordered.push(params[pos] === undefined ? null : params[pos]);
    return "?";
  });
  return { sql: converted, params: ordered };
}

function createSqlitePrismaAdapter(getSqlite) {
  const client = {};
  for (const modelName of Object.keys(MODELS)) {
    client[modelName] = createModelDelegate(getSqlite, modelName);
  }
  client.$executeRawUnsafe = async (sql, ...params) => {
    const sqlite = getSqlite();
    const bound = bindDollarParams(sql, params);
    const info = sqlite.prepare(bound.sql).run(...bound.params);
    return info?.changes || 0;
  };
  client.$queryRawUnsafe = async (sql, ...params) => {
    const sqlite = getSqlite();
    const bound = bindDollarParams(sql, params);
    return sqlite.prepare(bound.sql).all(...bound.params);
  };
  client.$transaction = async (fn) => {
    const sqlite = getSqlite();
    const sp = "sp_" + crypto.randomUUID().replace(/-/g, "");
    sqlite.exec(`SAVEPOINT ${sp}`);
    try {
      const result = await fn(client);
      sqlite.exec(`RELEASE SAVEPOINT ${sp}`);
      return result;
    } catch (err) {
      try {
        sqlite.exec(`ROLLBACK TO SAVEPOINT ${sp}`);
        sqlite.exec(`RELEASE SAVEPOINT ${sp}`);
      } catch {}
      throw err;
    }
  };
  client.$disconnect = async () => {};
  return client;
}

module.exports = { createSqlitePrismaAdapter };
