const express = require('express');
const axios = require('axios');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

/**
 * GET /api/webrtc/turn-credentials
 * Fetches dynamic STUN/TURN credentials from Metered.ca.
 * Falls back to public Google STUN servers if Metered is unconfigured or unreachable.
 */
router.get('/turn-credentials', auth, async (req, res) => {
  try {
    const { METERED_APP_NAME, METERED_API_KEY } = process.env;

    if (!METERED_APP_NAME || !METERED_API_KEY) {
      console.warn('[WebRTC] Metered.ca APP name or API key is not set. Falling back to Google STUN.');
      return res.json({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
    }

    const response = await axios.get(
      `https://${METERED_APP_NAME}.metered.live/api/v1/turn/credentials`,
      {
        params: { apiKey: METERED_API_KEY },
        timeout: 5000 // 5 seconds timeout limit
      }
    );

    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('[WebRTC] Successfully fetched TURN credentials from Metered.ca');
      return res.json({ iceServers: response.data });
    }

    throw new Error('Invalid response structure from Metered.ca API');
  } catch (error) {
    console.error('[WebRTC] Error retrieving TURN credentials:', error.message);
    // Graceful safety fallback so users can still attempt STUN connection
    return res.json({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
  }
});

module.exports = router;
