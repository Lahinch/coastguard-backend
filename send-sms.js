
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

exports.handler = async function(event, context) {
  // CORS headers will be handled by vercel.json, but we can keep a fallback
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const userPhoneNumber = data.phone;
    if (!userPhoneNumber) {
      return { statusCode: 400, headers, body: 'Phone number is required.' };
    }

    // --- SMART LINK CREATION ---
    // Get the full path of the page that made the request (e.g., /V9/rescue.html)
    const referer = event.headers.referer || '';
    const url = new URL(referer);
    // Get the directory path (e.g., /V9/)
    const directoryPath = url.pathname.substring(0, url.pathname.lastIndexOf('/'));
    
    // Create the correct link
    const locationUrl = `https://www.sarcommand.ie${directoryPath}/locate.html`;
    
    await client.messages.create({
      body: `Emergency locator link from SAR Command. Please click to share your location: ${locationUrl}`,
      from: twilioPhoneNumber,
      to: userPhoneNumber
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'SMS sent successfully!' })
    };
  } catch (error) {
    console.error('Twilio SMS sending failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send SMS.' })
    };
  }
};
