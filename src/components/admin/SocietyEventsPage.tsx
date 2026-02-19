import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    Clock,
    MapPin,
    Search,
    ArrowLeft,
    Filter,
    Eye,
    MoreVertical,
    Download,
    FileText
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis
} from "@/components/ui/pagination";
import { formatTimeToAMPM } from "@/lib/utils";
import axios from "axios";
import EventRequestDetailModal from "./EventRequestDetailModal";
import { useToast } from "@/components/ui/use-toast";

const SocietyEventsPage = () => {
    const { societyId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filter, setFilter] = useState<string>("all"); // all, approved, report_missing, report_submitted

    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchSocietyEvents();
    }, [societyId]);

    const fetchSocietyEvents = async () => {
        try {
            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required");
                return;
            }

            // Get current user role
            const user = localStorage.getItem("user");
            const userData = user ? JSON.parse(user) : null;
            const userRole = userData?.role || "vc";

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/admin/event-requests`,
                {
                    role: userRole,
                    society_id: parseInt(societyId || "0"),
                    filter: "all"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                // Filter for specific statuses: 10 (Approved), 12 (Report Submitted), 13 (Report Missing)
                const relevantEvents = (response.data.data || []).filter((e: any) =>
                    [10, 12, 13].includes(e.status_id)
                );
                setEvents(relevantEvents);
            } else {
                setError("Failed to load events");
            }
        } catch (err: any) {
            console.error("Error fetching events:", err);
            setError(err.response?.data?.message || "Failed to fetch events");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (reqId: number) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/event-requests/${reqId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedEvent(response.data.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            console.error("Error fetching details", err);
            toast({
                title: "Error",
                description: "Failed to fetch event details",
                variant: "destructive",
            });
        }
    };

    // Filter logic
    const filteredEvents = events.filter(event => {
        // Status filter
        if (filter === "approved" && event.status_id !== 10) return false;
        if (filter === "report_missing" && event.status_id !== 13) return false;
        if (filter === "report_submitted" && event.status_id !== 12) return false;

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                event.title?.toLowerCase().includes(searchLower) ||
                event.event_name?.toLowerCase().includes(searchLower) ||
                event.description?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const currentEvents = filteredEvents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 hover:pl-2 transition-all"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-university-navy">Society Events</h1>
                        <p className="text-muted-foreground mt-1">
                            Viewing Approved, Report Missing, and Report Submitted events
                        </p>
                    </div>
                </div>

                <Card className="p-6 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={filter === "all" ? "default" : "outline"}
                                onClick={() => setFilter("all")}
                                className={filter === "all" ? "bg-university-navy" : ""}
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === "approved" ? "default" : "outline"}
                                onClick={() => setFilter("approved")}
                                className={filter === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                Approved
                            </Button>
                            <Button
                                variant={filter === "report_missing" ? "default" : "outline"}
                                onClick={() => setFilter("report_missing")}
                                className={filter === "report_missing" ? "bg-red-600 hover:bg-red-700" : ""}
                            >
                                Report Missing
                            </Button>
                            <Button
                                variant={filter === "report_submitted" ? "default" : "outline"}
                                onClick={() => setFilter("report_submitted")}
                                className={filter === "report_submitted" ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                Report Submitted
                            </Button>
                        </div>
                    </div>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-navy mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading events...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-slate-800">No events found</h3>
                        <p className="text-muted-foreground mt-1">Try adjusting your filters or search terms</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {currentEvents.map((event) => (
                            <Card key={event.req_id} className="p-5 hover:shadow-md transition-shadow border-l-4 border-l-university-gold">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <h3 className="text-xl font-semibold text-university-navy">
                                                {event.title || event.event_name}
                                            </h3>
                                            <Badge
                                                className={
                                                    event.status_id === 10 ? "bg-green-100 text-green-800 hover:bg-green-200" :
                                                        event.status_id === 13 ? "bg-red-100 text-red-800 hover:bg-red-200" :
                                                            event.status_id === 12 ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                                                                "bg-slate-100 text-slate-800"
                                                }
                                            >
                                                {event.status_name}
                                            </Badge>
                                        </div>

                                        <p className="text-slate-600 mb-4 line-clamp-2">{event.description}</p>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{new Date(event.date_from || event.event_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {event.time_from ? formatTimeToAMPM(event.time_from) : "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{event.venue || "No venue"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(event.req_id)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                        {event.status_id === 12 && (
                                            <Button variant="ghost" size="sm" className="text-blue-600">
                                                <FileText className="h-4 w-4 mr-2" />
                                                View Report
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {filteredEvents.length > itemsPerPage && (
                    <div className="mt-8">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                onClick={() => setCurrentPage(page)}
                                                isActive={currentPage === page}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                <EventRequestDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    eventRequest={selectedEvent}
                    variant="detailed"
                />
            </div>
        </div>
    );
};

export default SocietyEventsPage;
