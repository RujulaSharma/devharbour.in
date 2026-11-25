const crypto = require("node:crypto");
const { profilePrisma } = require("./prisma");
const { invalid, text } = require("./validation");
const bucket = "developer-profile-private";
function client() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw Object.assign(new Error("Profile storage is not configured."), {
      status: 503,
    });
  return require("@supabase/supabase-js").createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
function configured() {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
async function upload(userId, kind, bytes, mime, label) {
  if (
    !["avatar", "cover", "resume", "certificate"].includes(kind) ||
    !Buffer.isBuffer(bytes) ||
    !bytes.length ||
    bytes.length > 4 * 1024 * 1024
  )
    throw invalid("Choose an image or PDF up to 4 MB.");
  let content = bytes,
    extension;
  if (["avatar", "cover"].includes(kind)) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(mime))
      throw invalid("Only PNG, JPEG and WebP images are accepted.");
    try {
      const sharp = require("sharp");
      const metadata = await sharp(bytes, {
        limitInputPixels: 16000000,
      }).metadata();
      if (
        !["png", "jpeg", "webp"].includes(metadata.format) ||
        metadata.pages > 1
      )
        throw Error();
      content = await sharp(bytes, { limitInputPixels: 16000000 })
        .rotate()
        .resize(kind === "avatar" ? 512 : 1600, kind === "avatar" ? 512 : 480, {
          fit: "cover",
        })
        .webp({ quality: 85 })
        .toBuffer();
      mime = "image/webp";
      extension = "webp";
    } catch {
      throw invalid(
        "The image is invalid or exceeds the supported dimensions.",
      );
    }
  } else {
    if (
      mime !== "application/pdf" ||
      bytes.subarray(0, 5).toString() !== "%PDF-"
    )
      throw invalid("Documents must be PDF files.");
    try {
      const { PDFDocument, PDFDict } = require("pdf-lib");
      const document = await PDFDocument.load(bytes, {
        ignoreEncryption: false,
      });
      if (document.getPageCount() > 100) throw Error();
      // pdf-lib resolves compressed object streams before inspection. Looking only at
      // the original bytes misses action dictionaries stored inside those streams.
      for (const [, object] of document.context.enumerateIndirectObjects()) {
        const dictionary = object instanceof PDFDict ? object : object.dict;
        if (!dictionary?.entries) continue;
        for (const [key, value] of dictionary.entries()) {
          if (
            [
              "/JavaScript",
              "/JS",
              "/Launch",
              "/EmbeddedFiles",
              "/EmbeddedFile",
              "/OpenAction",
              "/AA",
              "/RichMedia",
              "/XFA",
            ].includes(key.toString()) ||
            (key.toString() === "/S" &&
              [
                "/JavaScript",
                "/Launch",
                "/GoToR",
                "/SubmitForm",
                "/ImportData",
              ].includes(value.toString()))
          )
            throw Error();
        }
      }
    } catch {
      throw invalid(
        "The PDF is invalid, encrypted, too long, or contains active content.",
      );
    }
    // Documents are private attachments, never inline executable content.
    if (
      /\/JavaScript\b|\/JS\b|\/Launch\b|\/EmbeddedFile\b|\/OpenAction\b/i.test(
        bytes.toString("latin1"),
      )
    )
      throw invalid("Active or embedded PDF content is not supported.");
    extension = "pdf";
  }
  const p = profilePrisma();
  if ((await p.profileMedia.count({ where: { userId } })) >= 30)
    throw invalid("Remove an old upload before adding another.");
  const objectPath = userId + "/" + crypto.randomUUID() + "." + extension;
  const storage = client().storage.from(bucket);
  const result = await storage.upload(objectPath, content, {
    contentType: mime,
    upsert: false,
    cacheControl: "300",
  });
  if (result.error)
    throw Object.assign(
      new Error(
        "Upload failed. Check the private storage bucket configuration.",
      ),
      { status: 503 },
    );
  try {
    return await p.profileMedia.create({
      data: {
        userId,
        kind,
        objectPath,
        mime,
        bytes: content.length,
        label: text(label || kind, 120).replace(/[\r\n]/g, " "),
      },
    });
  } catch (error) {
    await storage.remove([objectPath]);
    throw error;
  }
}
async function signed(record) {
  const { data, error } = await client()
    .storage.from(bucket)
    .createSignedUrl(record.objectPath, 300, {
      download: record.kind === "resume" || record.kind === "certificate",
    });
  if (error)
    throw Object.assign(new Error("File is temporarily unavailable."), {
      status: 503,
    });
  return data.signedUrl;
}
async function remove(userId, id) {
  const p = profilePrisma();
  const record = await p.profileMedia.findFirst({ where: { id, userId } });
  if (!record)
    throw Object.assign(new Error("Upload not found."), { status: 404 });
  const { error } = await client()
    .storage.from(bucket)
    .remove([record.objectPath]);
  if (error)
    throw Object.assign(new Error("Could not remove the upload."), {
      status: 503,
    });
  await p.profileMedia.deleteMany({ where: { id, userId } });
}
module.exports = { configured, upload, signed, remove };
