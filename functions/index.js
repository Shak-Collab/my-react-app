const functions = require("firebase-functions");
const { AccessToken } = require("livekit-server-sdk");

const LIVEKIT_API_KEY = "APIZW4paSseAKCg";
const LIVEKIT_API_SECRET = "upggMhyaSSbIfexUcWHtPXVX9JbeDBvADFzyNl5fAtlA";

exports.getLiveKitToken = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const { roomName, participantName } = req.body;
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName || "user-" + Date.now(),
  });
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
  const token = await at.toJwt();
  res.json({ token });
});