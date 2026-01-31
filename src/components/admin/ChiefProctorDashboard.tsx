import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Calendar,
    Eye,
    LogOut,
    Clock,
    FileText,
    MapPin,
    Shield,
    Filter,
    MoreVertical,
    User
} from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import EventRequestDetailModal from "@/components/admin/EventRequestDetailModal";

const ChiefProctorDashboard = () => {
    const { toast } = useToast();
    const [eventRequests, setEventRequests] = useState([]);
    const [selectedEventRequest, setSelectedEventRequest] = useState(null);
    const [isEventRequestModalOpen, setIsEventRequestModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Filters
    const [selectedVenueId, setSelectedVenueId] = useState<string>("all");
    const [selectedDate, setSelectedDate] = useState<string>("");

    // Venues list
    const [venues, setVenues] = useState<Array<{ venue_id: number; venue_name: string }>>([]);

    // Stats
    const [eventRequestStats, setEventRequestStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [statsLoading, setStatsLoading] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Helper function to convert 24h time to AM/PM
    const formatTimeToAMPM = (time24: string) => {
        if (!time24) return "";
        try {
            const [hours, minutes] = time24.split(":");
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? "PM" : "AM";
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch (e) {
            return time24;
        }
    };

    // Get status badge variant
    const getStatusVariant = (statusId) => {
        if ([1].includes(statusId)) return "secondary"; // Pending
        if ([2, 4, 6, 8, 10, 11, 13, 15].includes(statusId)) return "default"; // Approved statuses
        if ([3, 5, 7, 9, 12, 14, 16].includes(statusId)) return "destructive"; // Rejected statuses
        return "outline";
    };

    // Fetch venues
    const fetchVenues = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await axios.get(`${API_URL}/society/venues`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setVenues(response.data.data || []);
            }
        } catch (err) {
            console.error("Error fetching venues:", err);
        }
    };

    // Fetch event requests with filters
    const fetchEventRequests = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            // We use the generic endpoint with our role
            const payload: any = {
                role: "proctor",
                filter: "all"
            };

            const response = await axios.post(
                `${API_URL}/admin/event-requests`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                let data = response.data.data || [];

                // Client-side filtering for Venue and Date since generic endpoint might not support them in query
                if (selectedVenueId && selectedVenueId !== "all") {
                    data = data.filter(item => item.venue === venues.find(v => String(v.venue_id) === selectedVenueId)?.venue_name);
                    // Note: API returns venue name in 'venue', but we have ID in filter. 
                    // Ideally API should filter, but for now client side is safer if API doesn't support complex filters
                    // Actually, let's try to match more loosely or if backend supports it.
                    // Re-reading controller: generic get doesn't seem to support query params for venue/date easily in the same way protocol one does.
                    // It returns 'venue' string name.
                }

                if (selectedDate) {
                    data = data.filter(item => item.event_date && item.event_date.startsWith(selectedDate));
                }

                setEventRequests(data);
                setCurrentPage(1); // Reset to first page when data changes
            }
        } catch (err: any) {
            console.error("Error fetching event requests:", err);
            setError(err.response?.data?.message || err.message || "Failed to fetch event requests");
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to fetch event requests",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle view event request details
    const handleViewEventRequest = async (reqId) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.get(`${API_URL}/admin/event-requests/${reqId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSelectedEventRequest(response.data.data);
            setIsEventRequestModalOpen(true);
        } catch (err) {
            console.error("Error fetching event request details:", err);
            setError(err.response?.data?.message || "Failed to fetch event request details");
        } finally {
            setLoading(false);
        }
    };

    // Fetch event request stats
    const fetchEventRequestStats = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            setStatsLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axios.post(`${API_URL}/admin/event-requests/stats`, {
                role: "proctor"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setEventRequestStats(response.data.data || { total: 0, pending: 0, approved: 0, rejected: 0 });
        } catch (err) {
            console.error("Error fetching event request stats:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
        fetchEventRequests();
        fetchEventRequestStats();
    }, [selectedVenueId, selectedDate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="gradient-primary text-white py-6 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center">
                                <Shield className="h-8 w-8 mr-3" />
                                Chief Proctor Dashboard
                            </h1>
                            <p className="text-white/80">View Approved Event Requests</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-white border-white hover:bg-white/20 bg-transparent"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Dashboard Content */}
            <section className="py-8 px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Stats Overview - Event Requests */}
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <Card className="p-6 shadow-card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Visible</p>
                                    <p className="text-2xl font-bold text-university-navy">
                                        {statsLoading ? "..." : eventRequestStats.total}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-university-navy" />
                            </div>
                        </Card>

                        {/* 
                For Chief Proctor, they mostly see 'approved' events (status 10+), 
                so 'pending' might convert to 'active events' contextually or be 0 if we only show 10+.
             */}
                    </div>

                    {/* Filters Section */}
                    <Card className="p-4 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-5 w-5 text-university-navy" />
                            <h3 className="text-lg font-semibold text-university-navy">Filters</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label>Venue</Label>
                                <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Venues" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Venues</SelectItem>
                                        {venues.map((venue) => (
                                            <SelectItem key={venue.venue_id} value={String(venue.venue_id)}>
                                                {venue.venue_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    placeholder="Select date"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedVenueId("all");
                                        setSelectedDate("");
                                    }}
                                    className="w-full"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Error Display */}
                    {error && (
                        <Card className="p-4 border-red-200 bg-red-50 mb-6">
                            <p className="text-red-600">Error: {error}</p>
                        </Card>
                    )}

                    {/* Event Requests List */}
                    {loading && eventRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading event requests...</p>
                        </div>
                    ) : eventRequests.length > 0 ? (
                        <>
                            <div className="grid gap-4">
                                {eventRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((request) => (
                                    <Card key={request.req_id} className="p-4 shadow-card">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2 flex-wrap gap-2">
                                                    <h3 className="text-lg font-semibold text-university-navy">
                                                        {request.event_name || request.title || "Event Request"}
                                                    </h3>
                                                    {request.status_id && (
                                                        <Badge variant={getStatusVariant(request.status_id)}>
                                                            {request.status_name || "Pending"}
                                                        </Badge>
                                                    )}
                                                    {request.society_name && (
                                                        <Badge variant="outline">{request.society_name}</Badge>
                                                    )}
                                                </div>
                                                {request.event_type && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Type: {request.event_type}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
                                                    {request.date_from && ( // Use date_from/event_date alias check
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(request.date_from || request.event_date).toLocaleDateString()}
                                                            {(request.date_to && request.date_to !== request.date_from) && (
                                                                <> - {new Date(request.date_to).toLocaleDateString()}</>
                                                            )}
                                                        </span>
                                                    )}
                                                    {request.time_from && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatTimeToAMPM(request.time_from || request.event_time)}
                                                            {(request.time_to) && <> - {formatTimeToAMPM(request.time_to)}</>}
                                                        </span>
                                                    )}
                                                    {(request.venue_name || request.venue) && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {request.venue_name || request.venue}
                                                        </span>
                                                    )}
                                                    {request.advisor_name && (
                                                        <span className="flex items-center gap-1">
                                                            👤 Advisor: {request.advisor_name}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center text-xs text-muted-foreground mt-2">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Created: {new Date(request.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 ml-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleViewEventRequest(request.req_id)}
                                                            disabled={loading}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {eventRequests.length > itemsPerPage && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, eventRequests.length)} of {eventRequests.length} event requests
                                    </div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                            {/* Detailed pagination logic can be added here if needed */}
                                            <PaginationItem>
                                                <span className="px-4 text-sm">Page {currentPage}</span>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(eventRequests.length / itemsPerPage), prev + 1))}
                                                    className={currentPage === Math.ceil(eventRequests.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed text-muted-foreground">
                            <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p>No event requests found regarding your criteria.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Event Details Modal */}
            <EventRequestDetailModal
                isOpen={isEventRequestModalOpen}
                onClose={() => setIsEventRequestModalOpen(false)}
                eventRequest={selectedEventRequest}
            />

        </div>
    );
};

export default ChiefProctorDashboard;

function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>{children}</label>
}
