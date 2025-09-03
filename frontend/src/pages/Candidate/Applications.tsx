import React, { useEffect, useState } from "react";
import { jobAPI } from "../../services/api";
import { ClipboardList, Calendar, MapPin, Building, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
}

interface Application {
    id: number;
    job: Job;
    status: string;
    applied_at: string;
}

const Applications: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        jobAPI.getMyApplications()
            .then((data) => {
                setApplications(data.results || data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'hired':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'interview_scheduled':
                return <Calendar className="w-5 h-5 text-blue-500" />;
            case 'shortlisted':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'hired':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'interview_scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'shortlisted':
                return 'bg-yellow-100 text-yellow-800';
            case 'under_review':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 mb-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                        <ClipboardList className="w-8 h-8 text-blue-600" />
                        <span>My Applications</span>
                    </h1>
                    <p className="text-gray-600 mt-2">Track the status of your job applications</p>
                </div>
                <div className="text-sm text-gray-500">
                    {applications.length} application{applications.length !== 1 ? 's' : ''} total
                </div>
            </div>

            {/* Applications List */}
            {applications.length === 0 ? (
                <div className="text-center py-12">
                    <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-6">Start applying to jobs to track your applications here.</p>
                    <a
                        href="http://localhost:5173/jobs"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all inline-block"
                    >
                        Browse Jobs
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">{app.job.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                                            {app.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-6 text-gray-600 mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Building className="w-4 h-4" />
                                            <span>{app.job.company}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{app.job.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(app.status)}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="text-sm text-gray-500">
                                    Last updated: {new Date(app.applied_at).toLocaleDateString()}
                                </div>
                                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                    View Job Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Applications;
