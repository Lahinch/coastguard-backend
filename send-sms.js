const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// List of approved frontend origins
const allowedOrigins = [
  'https://www.sarcommand.ie',
  'https://sarcommand.ie'
];

exports.handler = async function(event, context) {
  const origin = event.headers.origin;
  const referer = event.headers.referer || ''; // The full URL of the page that made the request

  let headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Dynamically set the Allow-Origin header if the request is from an approved domain
  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const userPhoneNumber = data.phone;
    if (!userPhoneNumber) {
      return { statusCode: 400, headers, body: 'Phone number is required.' };
    }

    // --- THIS IS THE FIX ---
    // Check the 'referer' header to see which page sent the request
    const locatePath = referer.includes('/V9/') ? '/V9/locate.html' : '/smsping/locate.html';
    const locationUrl = `https://www.sarcommand.ie${locatePath}`;
    
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
