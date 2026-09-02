const { getDb, save, generateId } = require("../db/database");

async function sendNotification({ userId, type, title, message, metadata = {} }) {
  const db = getDb();
  const notification = {
    id: generateId("notif"),
    userId,
    type,
    title,
    message,
    metadata,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(notification);
  save();
  console.log(`🔔 [${type}] ${title}: ${message}`);
  return notification;
}

async function sendSMS(phone, message) {
  // Placeholder for Twilio/Firebase SMS integration
  console.log(`📲 SMS to ${phone}: ${message}`);
  return { success: true, provider: "mock-sms" };
}

async function sendPush(userId, title, body) {
  console.log(`📲 Push to ${userId}: ${title} - ${body}`);
  return { success: true, provider: "mock-push" };
}

async function triggerEmergencyAlerts(patientId, reason, location) {
  const db = getDb();
  const contacts = db.emergencyContacts.filter((c) => c.patientId === patientId);
  const user = db.users.find((u) => u.patientId === patientId);

  const alerts = [];
  for (const contact of contacts) {
    const msg = `EMERGENCY ALERT for ${patientId}: ${reason}. Location: ${location || "Unknown"}`;
    await sendSMS(contact.phone, msg);
    alerts.push({ contact: contact.name, phone: contact.phone, sent: true });
  }

  if (user) {
    await sendNotification({
      userId: user.id,
      type: "emergency",
      title: "Emergency Alert Triggered",
      message: reason,
      metadata: { location, contactsNotified: alerts.length },
    });
    await sendPush(user.id, "Emergency Alert", reason);
  }

  // Notify ambulance service (mock)
  await sendSMS("108", `Ambulance request for patient ${patientId}. Reason: ${reason}. Location: ${location || "Unknown"}`);

  return { alertsSent: alerts.length, contacts: alerts, ambulanceNotified: true };
}

module.exports = { sendNotification, sendSMS, sendPush, triggerEmergencyAlerts };
