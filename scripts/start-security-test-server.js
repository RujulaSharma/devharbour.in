// Dedicated browser-test server; all writes go to a fresh isolated temporary SQLite database.
const fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path");
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), "devharbour-browser-security-"),
);
process.env.NODE_ENV = "test";
process.env.DB_PROVIDER = "sqlite";
process.env.DB_PATH = path.join(directory, "test.sqlite");
process.env.PORT = "3101";
// The database module initializes a fresh isolated test database.
const app = require("../server/index"),
  db = require("../server/database");
// Fake mail exists only in this isolated test harness. No API exposes test codes.
app.locals.emailVerificationService = require('../server/email-verification').createService({
  store: require('../server/email-verification-store').createStore(db),
  secret: 'a'.repeat(64), isConfigured: () => true,
  randomCode: () => '482915', sendMail: async () => {},
});
db.insertParticipant({ candidateName: 'Browser Certificate Fixture', candidateEmail: 'mailbox-fixture@example.test', candidateOrganisation: 'Isolated test' });
const participant = db.findParticipantByEmail('mailbox-fixture@example.test');
db.issueCertificate({ participantId: participant.id, recipientName: participant.candidate_name,
  recipientEmail: participant.candidate_email, recipientOrganisation: 'Isolated test',
  eventSlug: 'orca-coders-orcathon-2026', certificateType: 'Participation', issueDate: 'October 25, 2026' });
const server = app.listen(3101, "127.0.0.1", () =>
  console.log("Isolated security browser server ready."),
);
async function stop() {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await db.close();
  if (
    !path
      .resolve(directory)
      .startsWith(
        path.resolve(os.tmpdir()) + path.sep + "devharbour-browser-security-",
      )
  )
    throw Error("Unsafe cleanup path");
  fs.rmSync(directory, { recursive: true, force: true });
  process.exit(0);
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
