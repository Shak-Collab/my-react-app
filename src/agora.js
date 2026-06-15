import AgoraRTC from "agora-rtc-sdk-ng";

export const APP_ID = "fbcbc9efc76940afaa5299f4c7e72ffe";

export const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });