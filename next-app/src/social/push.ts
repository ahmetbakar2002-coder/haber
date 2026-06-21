import axios from 'axios';

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

export async function sendWebPushNotification(title: string, message: string, url: string, imageUrl?: string) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
    console.warn("OneSignal credentials missing. Push notification skipped.");
    return;
  }

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    headings: { en: title, tr: title },
    contents: { en: message, tr: message },
    url: url,
    chrome_web_image: imageUrl,
    included_segments: ["Active Users", "Subscribed Users"]
  };

  try {
    await axios.post('https://onesignal.com/api/v1/notifications', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`
      }
    });
    console.log(`Web Push Notification sent: ${title}`);
  } catch (error) {
    console.error('OneSignal Push Error:', error);
  }
}
