import React, { useEffect, useState } from 'react';
import { fetchJobs, syncGmail } from '../../services/api';
import { Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bgClass} ${colorClass}`}>
            <Icon size={24} />
        </div>
        <div className="flex flex-col">
            <span className="text-2xl font-bold leading-tight text-slate-900">{value}</span>
            <span className="text-sm text-slate-500">{title}</span>
        </div>
    </div>
);

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState({ total: 0, interviewing: 0, offers: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const loadData = async () => {
        try {
            const data = await fetchJobs();
            setJobs(data);

            // Calculate stats
            const newStats = {
                total: data.length,
                interviewing: data.filter(j => j.status === 'Interviewing').length,
                offers: data.filter(j => j.status === 'Offer').length,
                rejected: data.filter(j => j.status === 'Rejected').length,
            };
            setStats(newStats);
        } catch (error) {
            console.error('Failed to load jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await syncGmail();
            await loadData();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Welcome back! Here's an overview of your job search.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                >
                    <Clock size={16} className={syncing ? "animate-spin" : ""} />
                    {syncing ? 'Syncing...' : 'Sync Gmail'}
                </button>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Applied"
                    value={stats.total}
                    icon={Briefcase}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50"
                />
                <StatCard
                    title="Interviewing"
                    value={stats.interviewing}
                    icon={Clock}
                    colorClass="text-amber-500"
                    bgClass="bg-amber-50"
                />
                <StatCard
                    title="Offers"
                    value={stats.offers}
                    icon={CheckCircle}
                    colorClass="text-emerald-500"
                    bgClass="bg-emerald-50"
                />
                <StatCard
                    title="Rejected"
                    value={stats.rejected}
                    icon={XCircle}
                    colorClass="text-red-500"
                    bgClass="bg-red-50"
                />
            </div>

            <section>
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Recent Applications</h2>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {jobs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No applications yet.</div>
                    ) : (
                        jobs.slice(0, 3).map((job, index) => (
                            <div
                                key={job.id}
                                className={`flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 ${index !== jobs.slice(0, 3).length - 1 ? 'border-b border-slate-200' : ''
                                    }`}
                            >
                                {job.logo ? (
                                    <img src={job.logo} alt={job.company} className="h-10 w-10 rounded-lg object-cover" />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                        <Briefcase size={20} />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">{job.position}</h3>
                                    <p className="text-sm text-slate-500">{job.company}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${job.status === 'Applied' ? 'bg-blue-50 text-blue-600' :
                                        job.status === 'Interviewing' ? 'bg-amber-50 text-amber-600' :
                                            job.status === 'Offer' ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-red-50 text-red-600'
                                    }`}>
                                    {job.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
