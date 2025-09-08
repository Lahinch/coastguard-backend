// Import the Twilio helper library
const twilio = require('twilio');

// IMPORTANT: Store your credentials securely as environment variables.
// Do NOT hardcode them in your file.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize the Twilio client
const client = twilio(accountSid, authToken);

// This is the main function that will be executed when the API endpoint is called.
// The exact syntax might vary slightly depending on your hosting provider (Vercel, Netlify, etc.)
exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const userPhoneNumber = data.phone;

    if (!userPhoneNumber) {
      return { statusCode: 400, body: 'Phone number is required.' };
    }

    // --- Generate the Unique Location Link ---
    // In a real application, you'd generate a truly unique ID and maybe store it.
    // For now, we'll use a static channel name as planned.
    const uniqueId = 'coastguard_rescue_channel'; // This should be dynamic in a full version
    const locationUrl = `https://YOUR_WEBSITE_DOMAIN/locate.html?id=${uniqueId}`;
    
    // --- Create and Send the SMS using the Twilio API ---
    await client.messages.create({
      body: `Emergency locator link from the Irish Coast Guard. Please click to share your location: ${locationUrl}`,
      from: twilioPhoneNumber,
      to: userPhoneNumber
    });

    console.log(`SMS sent successfully to ${userPhoneNumber}`);
    
    // Return a success response to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'SMS sent successfully!' })
    };

  } catch (error) {
    console.error('Twilio SMS sending failed:', error);
    
    // Return an error response to the frontend
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send SMS.' })
    };
  }
};