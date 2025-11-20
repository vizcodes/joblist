const express = require('express');
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Generate a url that asks permissions for Gmail scopes
const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
];

router.get('/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // 'offline' gets refresh_token
        scope: scopes,
        prompt: 'consent' // Force consent to ensure we get a refresh token
    });
    res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);

        // Store tokens in database
        // We assume a single user system for now, so we just update the first record or create it
        const existingSettings = await prisma.settings.findFirst();
        if (existingSettings) {
            await prisma.settings.update({
                where: { id: existingSettings.id },
                data: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || existingSettings.refreshToken, // Keep old refresh token if new one not provided
                }
            });
        } else {
            await prisma.settings.create({
                data: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                }
            });
        }

        res.redirect('http://localhost:5173'); // Redirect back to frontend
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).send('Authentication failed');
    }
});

module.exports = router;
