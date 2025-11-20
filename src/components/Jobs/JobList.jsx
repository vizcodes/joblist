import React, { useEffect, useState } from 'react';
import { fetchJobs } from '../../services/api';
import { Search, Filter, Plus, Briefcase } from 'lucide-react';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadJobs = async () => {
            try {
                const data = await fetchJobs();
                setJobs(data);
            } catch (error) {
                console.error('Failed to load jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        loadJobs();
    }, []);

    if (loading) {
        return <div className="flex h-full items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-slate-900">Applications</h1>
                    <p className="text-slate-500">Track and manage your job applications.</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
                    <Plus size={20} />
                    <span>Add Application</span>
                </button>
            </header>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search companies or roles..."
                        className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
                    />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
                    <Filter size={20} />
                    <span>Filter</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {jobs.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-500">No applications found.</div>
                ) : (
                    jobs.map(job => (
                        <div
                            key={job.id}
                            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                {job.logo ? (
                                    <img src={job.logo} alt={job.company} className="h-12 w-12 rounded-lg object-cover" />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                        <Briefcase size={24} />
                                    </div>
                                )}
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${job.status === 'Applied' ? 'bg-blue-50 text-blue-600' :
                                        job.status === 'Interviewing' ? 'bg-amber-50 text-amber-600' :
                                            job.status === 'Offer' ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-red-50 text-red-600'
                                    }`}>
                                    {job.status}
                                </span>
                            </div>
                            <div>
                                <h3 className="mb-1 text-lg font-semibold text-slate-900">{job.position}</h3>
                                <p className="mb-4 font-medium text-slate-500">{job.company}</p>
                                <div className="flex gap-2 text-sm text-slate-400">
                                    <span>{job.location}</span>
                                    <span>•</span>
                                    <span>{new Date(job.dateApplied).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JobList;
