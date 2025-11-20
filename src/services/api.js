const API_URL = 'http://localhost:3001/api';

export const fetchJobs = async () => {
    const response = await fetch(`${API_URL}/jobs`);
    if (!response.ok) {
        throw new Error('Failed to fetch jobs');
    }
    return response.json();
};

export const createJob = async (job) => {
    const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(job),
    });
    if (!response.ok) {
        throw new Error('Failed to create job');
    }
    return response.json();
};

export const updateJobStatus = async (id, status) => {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) {
        throw new Error('Failed to update job');
    }
    return response.json();
};

export const deleteJob = async (id) => {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete job');
    }
    return response.json();
};

export const syncGmail = async () => {
    const response = await fetch(`${API_URL}/sync`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to sync Gmail');
    }
    return response.json();
};
