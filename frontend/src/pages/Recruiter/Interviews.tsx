import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Phone, Video, Search } from 'lucide-react';

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
  location?: string;
  notes?: string;
}

const Interviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'phone' | 'in-person'>('all');
  const [loading, setLoading] = useState(true);

  // Mock data for interviews
  const mockInterviews: Interview[] = [
    {
      id: '1',
      candidateName: 'John Smith',
      candidateEmail: 'john.smith@email.com',
      jobTitle: 'Senior Frontend Developer',
      date: '2025-08-20',
      time: '10:00 AM',
      type: 'video',
      status: 'scheduled',
      meetingLink: 'https://meet.google.com/abc-def-ghi',
      notes: 'Technical interview - React and TypeScript focus'
    },
    {
      id: '2',
      candidateName: 'Sarah Johnson',
      candidateEmail: 'sarah.j@email.com',
      jobTitle: 'UX Designer',
      date: '2025-08-21',
      time: '2:00 PM',
      type: 'video',
      status: 'scheduled',
      meetingLink: 'https://zoom.us/j/123456789',
      notes: 'Portfolio review and design challenge'
    },
    {
      id: '3',
      candidateName: 'Michael Brown',
      candidateEmail: 'mike.brown@email.com',
      jobTitle: 'Backend Developer',
      date: '2025-08-18',
      time: '11:00 AM',
      type: 'phone',
      status: 'completed',
      notes: 'Initial screening call - positive outcome'
    },
    {
      id: '4',
      candidateName: 'Emily Davis',
      candidateEmail: 'emily.davis@email.com',
      jobTitle: 'Product Manager',
      date: '2025-08-22',
      time: '3:30 PM',
      type: 'in-person',
      status: 'scheduled',
      location: 'Office - Conference Room A',
      notes: 'Final interview with team leads'
    },
    {
      id: '5',
      candidateName: 'David Wilson',
      candidateEmail: 'david.wilson@email.com',
      jobTitle: 'Data Scientist',
      date: '2025-08-19',
      time: '1:00 PM',
      type: 'video',
      status: 'cancelled',
      notes: 'Candidate requested reschedule'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInterviews(mockInterviews);
      setFilteredInterviews(mockInterviews);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = interviews;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(interview =>
        interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(interview => interview.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(interview => interview.type === typeFilter);
    }

    setFilteredInterviews(filtered);
  }, [searchTerm, statusFilter, typeFilter, interviews]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Management</h1>
          <p className="text-gray-600">Schedule and manage candidate interviews</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by candidate name, job title, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'scheduled' | 'completed' | 'cancelled')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="lg:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'video' | 'phone' | 'in-person')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="phone">Phone</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interviews List */}
        <div className="space-y-4">
          {filteredInterviews.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'No interviews scheduled yet'}
              </p>
            </div>
          ) : (
            filteredInterviews.map((interview) => (
              <div key={interview.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{interview.candidateName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{interview.jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(interview.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{interview.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(interview.type)}
                        <span className="capitalize">{interview.type.replace('-', ' ')}</span>
                      </div>
                    </div>

                    {interview.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {interview.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                    {interview.status === 'scheduled' && (
                      <>
                        {interview.meetingLink && (
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                          >
                            Join Meeting
                          </a>
                        )}
                        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                          Reschedule
                        </button>
                      </>
                    )}
                    
                    {interview.status === 'completed' && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                        View Notes
                      </button>
                    )}

                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      View Candidate
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Interviews;
