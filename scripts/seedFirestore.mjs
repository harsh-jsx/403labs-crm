import { readFile } from "node:fs/promises";
import admin from "firebase-admin";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysFromNow(d) {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt;
}

async function loadServiceAccount() {
  // Preferred: env var points to the JSON file
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const raw = await readFile(
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      "utf8",
    );
    return JSON.parse(raw);
  }
  // Fallback: local file (gitignored)
  const raw = await readFile(
    new URL("../serviceAccountKey.json", import.meta.url),
    "utf8",
  );
  return JSON.parse(raw);
}

async function main() {
  const serviceAccount = await loadServiceAccount();

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const db = admin.firestore();

  const leadSources = [
    "Call",
    "Partner",
    "Campaign",
    "Email",
    "Public Relations",
    "Web Site",
    "Existing Customer",
  ];
  const companies = [
    "Acme Corp",
    "Prospa-Palmes Bank",
    "EasyReservations",
    "Stop & Shop",
    "National Lumber",
    "Intealcard",
    "Irving's Sport Goods",
    "Win's Private Hospital",
  ];

  const leadStages = [
    "New",
    "Contacted",
    "Qualified",
    "Proposal",
    "Won",
    "Lost",
  ];
  const activityStatuses = ["Not Started", "Planned", "Started", "Done"];

  const now = new Date();

  // ---- Leads
  const leads = Array.from({ length: 18 }).map((_, i) => ({
    name: `Lead ${i + 1}`,
    company: pick(companies),
    source: pick(leadSources),
    stage: pick(leadStages),
    value: Math.floor(500 + Math.random() * 5000),
    createdAt: admin.firestore.Timestamp.fromDate(
      new Date(
        now.getTime() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000,
      ),
    ),
    updatedAt: admin.firestore.Timestamp.fromDate(now),
  }));

  // ---- Activities
  const activityTitles = [
    "Analyze sales stats",
    "Send weekly analytics to top management",
    "Prepare product presentation",
    "Organize trade show",
    "Review report for Top Management",
    "Send sales order draft",
    "Follow up on invoice",
    "Check delivery status",
  ];

  const activities = Array.from({ length: 12 }).map((_, i) => {
    const due = daysFromNow(Math.floor(Math.random() * 10) - 2);
    return {
      title: pick(activityTitles),
      status: pick(activityStatuses),
      priority: pick(["Low", "Normal", "High", "Urgent"]),
      account: pick(companies),
      dueAt: admin.firestore.Timestamp.fromDate(due),
      createdAt: admin.firestore.Timestamp.fromDate(
        new Date(now.getTime() - (i + 1) * 6 * 60 * 60 * 1000),
      ),
    };
  });

  // ---- Meetings (for calendar)
  const meetingTitles = [
    "Team Meeting",
    "Delivery Issue",
    "Packaging Sales Plan",
    "Discount Request Review",
    "Write emails to potential partners",
    "Daily meeting",
    "Smart Laser demo",
  ];

  const meetings = Array.from({ length: 16 }).map((_, i) => {
    const start = daysFromNow(Math.floor(Math.random() * 14));
    start.setHours(9 + (i % 6), (i % 2) * 30, 0, 0);
    const end = new Date(start.getTime() + 45 * 60 * 1000);

    return {
      title: pick(meetingTitles),
      account: pick(companies),
      startAt: admin.firestore.Timestamp.fromDate(start),
      endAt: admin.firestore.Timestamp.fromDate(end),
      color: pick(["violet", "cyan", "green", "amber", "rose"]),
      createdAt: admin.firestore.Timestamp.fromDate(now),
    };
  });

  // Write in batches
  const batch = db.batch();

  const leadsCol = db.collection("leads");
  const activitiesCol = db.collection("activities");
  const meetingsCol = db.collection("meetings");

  leads.forEach((doc) => batch.set(leadsCol.doc(), doc));
  activities.forEach((doc) => batch.set(activitiesCol.doc(), doc));
  meetings.forEach((doc) => batch.set(meetingsCol.doc(), doc));

  await batch.commit();

  // eslint-disable-next-line no-console
  console.log(
    `Seeded Firestore: ${leads.length} leads, ${activities.length} activities, ${meetings.length} meetings.`,
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
