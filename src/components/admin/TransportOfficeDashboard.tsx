import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Truck,
  MoreVertical,
  Search,
  CheckCircle,
  XCircle,
  Lock
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import EventRequestDetailModal from "@/components/admin/EventRequestDetailModal";
import ChangePasswordDialog from "@/components/auth/ChangePasswordDialog";

type TransportTab = "approved" | "report-missing" | "report-submitted";

/** Approved tab: VC-approved through finalized, excluding report rows (12, 13) */
const APPROVED_TAB_STATUS_IDS = [8, 10, 11, 15];

const TransportOfficeDashboard = () => {
  const { toast } = useToast();
  const [selectedEventRequest, setSelectedEventRequest] = useState(null);
  const [isEventRequestModalOpen, setIsEventRequestModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Filters & tabs
  const [activeTab, setActiveTab] = useState<TransportTab>("approved");
  const [searchQuery, setSearchQuery] = useState("");

  /** Full list from API (transport-visible statuses only), sorted */
  const [allEventRequests, setAllEventRequests] = useState<any[]>([]);

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
    if ([2, 4, 6, 8, 10, 11, 12, 15].includes(statusId)) return "default"; // Approved/Submitted statuses
    if ([13].includes(statusId)) return "outline"; // Report Missing
    if ([3, 5, 7, 9, 14, 16].includes(statusId)) return "destructive"; // Rejected statuses
    return "outline";
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

      // We use the generic endpoint with transport role
      const payload: any = {
        role: "transport_office_view",
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

        // Approved pipeline + reports (align with transport office visibility; exclude rejected/revise-only)
        const transportVisibleStatusIds = [8, 10, 11, 12, 13, 15];
        data = data.filter((item: any) =>
          transportVisibleStatusIds.includes(Number(item.status_id))
        );

        // Sort: latest event date first; missing/invalid event dates last; tie-break by created_at
        const eventDateMs = (item: any) => {
          const raw = item.date_from ?? item.event_date;
          if (raw == null || raw === "") return 0;
          const t = new Date(String(raw).slice(0, 10)).getTime();
          return Number.isNaN(t) ? 0 : t;
        };
        data.sort((a: any, b: any) => {
          const evB = eventDateMs(b);
          const evA = eventDateMs(a);
          if (evB !== evA) return evB - evA;
          const createdB = new Date(b.created_at || 0).getTime();
          const createdA = new Date(a.created_at || 0).getTime();
          return createdB - createdA;
        });

        setAllEventRequests(data);
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
        role: "transport_office_view"
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

  const tabCounts = useMemo(
    () => ({
      approved: allEventRequests.filter((r: any) =>
        APPROVED_TAB_STATUS_IDS.includes(Number(r.status_id))
      ).length,
      reportMissing: allEventRequests.filter((r: any) => Number(r.status_id) === 13).length,
      reportSubmitted: allEventRequests.filter((r: any) => Number(r.status_id) === 12).length,
    }),
    [allEventRequests]
  );

  const displayedEventRequests = useMemo(() => {
    let data = allEventRequests;
    if (activeTab === "approved") {
      data = data.filter((r: any) => APPROVED_TAB_STATUS_IDS.includes(Number(r.status_id)));
    } else if (activeTab === "report-missing") {
      data = data.filter((r: any) => Number(r.status_id) === 13);
    } else {
      data = data.filter((r: any) => Number(r.status_id) === 12);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      data = data.filter((r: any) => {
        const hay = [
          r.title,
          r.event_name,
          r.society_name,
          r.venue,
          r.venue_name,
          r.event_type,
          r.status_name,
          r.req_id != null ? String(r.req_id) : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return data;
  }, [allEventRequests, activeTab, searchQuery]);

  useEffect(() => {
    fetchEventRequests();
    fetchEventRequestStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

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
                <Truck className="h-8 w-8 mr-3" />
                Transport Office Dashboard
              </h1>
              <p className="text-white/80">Browse by status tab and search.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white/20 bg-transparent flex items-center gap-2"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
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
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold text-university-navy">
                    {statsLoading ? "..." : eventRequestStats.total}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-university-navy" />
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-university-navy">
                    {statsLoading ? "..." : eventRequestStats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-university-maroon" />
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-university-navy">
                    {statsLoading ? "..." : eventRequestStats.approved}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-university-navy">
                    {statsLoading ? "..." : eventRequestStats.rejected}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </Card>
          </div>

          {/* Tabs + search */}
          <Card className="p-4 mb-6 space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TransportTab)}
              className="w-full"
            >
              <TabsList className="grid h-auto w-full grid-cols-1 gap-2 p-2 sm:grid-cols-3">
                <TabsTrigger value="approved" className="w-full justify-center gap-2">
                  Approved
                  <Badge variant="secondary" className="tabular-nums">
                    {tabCounts.approved}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="report-missing" className="w-full justify-center gap-2">
                  Report missing
                  <Badge variant="secondary" className="tabular-nums">
                    {tabCounts.reportMissing}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="report-submitted" className="w-full justify-center gap-2">
                  Report submitted
                  <Badge variant="secondary" className="tabular-nums">
                    {tabCounts.reportSubmitted}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by event name, society, venue, type, or request ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search event requests"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Each tab lists requests for that status, sorted by event date (latest first). Search applies within the active tab.
            </p>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="p-4 border-red-200 bg-red-50 mb-6">
              <p className="text-red-600">Error: {error}</p>
            </Card>
          )}

          {/* Event Requests List */}
          {loading && allEventRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading event requests...</p>
            </div>
          ) : displayedEventRequests.length > 0 ? (
            <>
              <div className="grid gap-4">
                {displayedEventRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((request) => (
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
                          {(request.date_from || request.event_date) && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(request.date_from || request.event_date).toLocaleDateString()}
                              {(request.date_to && request.date_to !== (request.date_from || request.event_date)) && (
                                <> - {new Date(request.date_to).toLocaleDateString()}</>
                              )}
                            </span>
                          )}
                          {(request.time_from || request.event_time) && (
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
              {displayedEventRequests.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, displayedEventRequests.length)} of {displayedEventRequests.length} event requests
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-4 text-sm">Page {currentPage}</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(displayedEventRequests.length / itemsPerPage), prev + 1))}
                          className={currentPage === Math.ceil(displayedEventRequests.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
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

      <ChangePasswordDialog
        isOpen={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
      />
    </div>
  );
};

export default TransportOfficeDashboard;