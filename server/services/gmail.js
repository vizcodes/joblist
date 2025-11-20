const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getOAuthClient = async () => {
    const settings = await prisma.settings.findFirst();
    if (!settings || !settings.accessToken) {
        throw new Error('No access token found');
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: settings.accessToken,
        refresh_token: settings.refreshToken,
    });

    return oauth2Client;
};

const listMessages = async (auth, query) => {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 10, // Limit for now
    });
    return res.data.messages || [];
};

const getMessage = async (auth, id) => {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.get({
        userId: 'me',
        id: id,
    });
    return res.data;
};

const parseEmail = (message) => {
    const headers = message.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';

    // Simple heuristics
    let company = 'Unknown';
    let position = 'Unknown';
    let status = 'Applied';

    // Extract company from "From" or Subject
    // Example: "Application received - Software Engineer at Google"
    // Example: "Thanks for applying to Microsoft"

    if (subject.includes('at ')) {
        const parts = subject.split('at ');
        if (parts.length > 1) company = parts[1].trim();
    } else if (from.includes('@')) {
        // Extract domain name as company fallback
        const match = from.match(/@([^.]+)\./);
        if (match) company = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }

    if (subject.toLowerCase().includes('application')) status = 'Applied';
    if (subject.toLowerCase().includes('interview')) status = 'Interviewing';
    if (subject.toLowerCase().includes('offer')) status = 'Offer';
    if (subject.toLowerCase().includes('reject') || subject.toLowerCase().includes('unfortunately')) status = 'Rejected';

    // Try to extract position
    // Example: "Application for Senior Developer"
    if (subject.toLowerCase().includes('for ')) {
        const parts = subject.split(/for /i);
        if (parts.length > 1) {
            position = parts[1].split(' at')[0].trim(); // Stop before "at" if present
        }
    } else {
        position = subject; // Fallback
    }

    return {
        company,
        position,
        status,
        dateApplied: new Date(date),
        messageId: message.id,
        location: 'Remote', // Default
        description: message.snippet
    };
};

const syncEmails = async () => {
    try {
        const auth = await getOAuthClient();

        // Search for application related keywords
        const queries = [
            'subject:application',
            'subject:"thanks for applying"',
            'subject:interview',
            'subject:offer'
        ];

        let newJobsCount = 0;

        for (const query of queries) {
            const messages = await listMessages(auth, query);

            for (const msg of messages) {
                // Check if already imported
                const existing = await prisma.job.findUnique({
                    where: { messageId: msg.id }
                });

                if (!existing) {
                    const fullMsg = await getMessage(auth, msg.id);
                    const jobData = parseEmail(fullMsg);

                    await prisma.job.create({
                        data: jobData
                    });
                    newJobsCount++;
                }
            }
        }

        return { success: true, newJobs: newJobsCount };
    } catch (error) {
        console.error('Sync error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { syncEmails };
