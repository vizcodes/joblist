const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const { syncEmails } = require('./services/gmail');

app.use('/api/auth', authRoutes);

app.get('/api/test', (req, res) => {
    res.send('Test route working');
});

app.post('/api/sync', async (req, res) => {
    const result = await syncEmails();
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Create a job
app.post('/api/jobs', async (req, res) => {
    const { company, position, status, location, logo, description } = req.body;
    try {
        const job = await prisma.job.create({
            data: {
                company,
                position,
                status: status || 'Applied',
                location,
                logo,
                description
            }
        });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create job' });
    }
});

// Update a job
app.patch('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const job = await prisma.job.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// Delete a job
app.delete('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.job.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
