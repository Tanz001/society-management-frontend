import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Calendar,
  Eye,
  AlertTriangle,
  LogOut,
  Clock,
  FileText,
  MapPin,
  Truck,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TransportOfficeDashboard = () => {
  const [eventRequests, setEventRequests] = useState([]);
  const [selectedEventRequest, setSelectedEventRequest] = useState(null);
  const [isEventRequestModalOpen, setIsEventRequestModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [eventRequestStats, setEventRequestStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [eventRequestFilter, setEventRequestFilter] = useState<string>("all"); // all, pending, approved, rejected

  // Helper functions for event requester details
  const getRequesterName = (request) => {
    if (!request) return "Not available";
    const name = `${request.firstName || ""} ${request.lastName || ""}`.trim();
    if (name) return name;
    if (request.president_name) return request.president_name;
    if (request.submitted_by_name) return request.submitted_by_name;
    return "Not available";
  };

  const getRequesterEmail = (request) => {
    if (!request) return "Not provided";
    return request.email || request.president_email || request.submitted_by_email || "Not provided";
  };

  const getRequesterRoll = (request) => {
    if (!request) return null;
    return request.rollNo || request.RollNO || request.student_rollno || request.submitted_by_rollno || null;
  };

  // Get status badge variant
  const getStatusVariant = (statusId) => {
    if ([1].includes(statusId)) return "secondary"; // Pending
    if ([2, 4, 6, 8, 10, 11, 13, 15].includes(statusId)) return "default"; // Approved statuses
    if ([3, 5, 7, 9, 12, 14, 16].includes(statusId)) return "destructive"; // Rejected statuses
    return "outline";
  };

  // Fetch all event requests (read-only view)
  const fetchAllEventRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/admin/event-requests`,
        {
          role: "transport_office_view", // Special role for read-only view
          filter: eventRequestFilter
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Event requests fetched:", response.data);
      setEventRequests(response.data.data || []);
    } catch (err) {
      console.error("Error fetching event requests:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch event requests");
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

      const response = await axios.get(`${API_URL}/admin/event-requests/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: "transport_office_view" }
      });

      setEventRequestStats(response.data.data || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.error("Error fetching event request stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEventRequests();
    fetchEventRequestStats();
  }, [eventRequestFilter]);

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
              <p className="text-white/80">View All Event Transport Requests (Read-Only)</p>
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
                <FileText className="h-8 w-8 text-green-600" />
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
                <FileText className="h-8 w-8 text-red-600" />
              </div>
            </Card>
          </div>

          {/* Info Banner */}
          {/* <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Read-Only Access</p>
                <p className="text-sm text-blue-700">
                  You have view-only access to all event requests. You cannot modify statuses or add notes.
                </p>
              </div>
            </div>
          </Card> */}

          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-university-navy">All Event Requests</h2>
            <Button
              variant="outline"
              onClick={fetchAllEventRequests}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={eventRequestFilter === "all" ? "university" : "outline"}
              size="sm"
              onClick={() => {
                setEventRequestFilter("all");
                fetchAllEventRequests();
              }}
            >
              All
            </Button>
            <Button
              variant={eventRequestFilter === "pending" ? "university" : "outline"}
              size="sm"
              onClick={() => {
                setEventRequestFilter("pending");
                fetchAllEventRequests();
              }}
            >
              Pending
            </Button>
            <Button
              variant={eventRequestFilter === "approved" ? "university" : "outline"}
              size="sm"
              onClick={() => {
                setEventRequestFilter("approved");
                fetchAllEventRequests();
              }}
            >
              Approved
            </Button>
            <Button
              variant={eventRequestFilter === "rejected" ? "university" : "outline"}
              size="sm"
              onClick={() => {
                setEventRequestFilter("rejected");
                fetchAllEventRequests();
              }}
            >
              Rejected
            </Button>
          </div>

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
            <div className="grid gap-4">
              {eventRequests.map((request) => (
                <Card key={request.req_id} className="p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 flex-wrap gap-2">
                        <h3 className="text-lg font-semibold text-university-navy">{request.title}</h3>
                        {request.status_name && (
                          <Badge variant={getStatusVariant(request.status_id)}>
                            {request.status_name}
                          </Badge>
                        )}
                        {request.society_name && (
                          <Badge variant="outline">{request.society_name}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {request.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
                        <span>📅 {new Date(request.event_date).toLocaleDateString()}</span>
                        <span>🕐 {request.event_time}</span>
                        <span>📍 {request.venue}</span>
                        {request.firstName && request.lastName && (
                          <span>👤 {request.firstName} {request.lastName}</span>
                        )}
                      </div>
                      {request.note && (
                        <div className="bg-blue-50 border-l-4 border-blue-200 p-2 mt-2 rounded">
                          <p className="text-xs font-medium text-blue-900 mb-1">Note:</p>
                          <p className="text-xs text-blue-800">{request.note}</p>
                        </div>
                      )}
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Created: {new Date(request.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        size="sm"
                        variant="university"
                        onClick={() => handleViewEventRequest(request.req_id)}
                        disabled={loading}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Event Requests Found</h3>
              <p className="text-muted-foreground">
                No event requests have been submitted yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Event Request Detail Modal (Read-Only) */}
      <Dialog open={isEventRequestModalOpen} onOpenChange={setIsEventRequestModalOpen}>
        <DialogContent className="max-w-4xl h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Event Request Details</DialogTitle>
            <DialogDescription>
              Complete information about the event request
            </DialogDescription>
          </DialogHeader>

          {selectedEventRequest && (
            <div className="space-y-6 overflow-y-auto h-full">
              {/* Header Section */}
              <div className="gradient-primary text-white p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-12 w-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2 flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {selectedEventRequest.status_name}
                      </Badge>
                      {selectedEventRequest.society_name && (
                        <Badge variant="outline" className="text-white border-white">
                          {selectedEventRequest.society_name}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{selectedEventRequest.title}</h2>
                    <p className="text-white/90 mb-4">{selectedEventRequest.description}</p>
                    <div className="flex items-center flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedEventRequest.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedEventRequest.event_time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedEventRequest.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Event Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Name:</span>
                      <span className="font-medium">{selectedEventRequest.event_name || selectedEventRequest.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Type:</span>
                      <span className="font-medium">{selectedEventRequest.event_type || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date From:</span>
                      <span className="font-medium">
                        {selectedEventRequest.date_from
                          ? new Date(selectedEventRequest.date_from).toLocaleDateString()
                          : selectedEventRequest.event_date
                            ? new Date(selectedEventRequest.event_date).toLocaleDateString()
                            : "Not specified"}
                      </span>
                    </div>
                    {selectedEventRequest.date_to && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date To:</span>
                        <span className="font-medium">{new Date(selectedEventRequest.date_to).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time From:</span>
                      <span className="font-medium">{selectedEventRequest.time_from || selectedEventRequest.event_time || "Not specified"}</span>
                    </div>
                    {selectedEventRequest.time_to && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time To:</span>
                        <span className="font-medium">{selectedEventRequest.time_to}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span className="font-medium">{selectedEventRequest.venue || "Not specified"}</span>
                    </div>
                    {selectedEventRequest.collaborating_org && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Collaborating Org:</span>
                        <span className="font-medium">{selectedEventRequest.collaborating_org}</span>
                      </div>
                    )}
                    {selectedEventRequest.sponsor_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sponsor:</span>
                        <span className="font-medium">{selectedEventRequest.sponsor_name}</span>
                      </div>
                    )}
                    {selectedEventRequest.sponsor_amount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sponsor Amount:</span>
                        <span className="font-medium text-green-600">
                          {typeof selectedEventRequest.sponsor_amount === 'string'
                            ? (selectedEventRequest.sponsor_amount.startsWith('PKR') || selectedEventRequest.sponsor_amount.startsWith('$')
                              ? selectedEventRequest.sponsor_amount.replace(/^\$/, 'PKR ')
                              : `PKR ${selectedEventRequest.sponsor_amount}`)
                            : `PKR ${selectedEventRequest.sponsor_amount}`}
                        </span>
                      </div>
                    )}
                    {selectedEventRequest.coordinator_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coordinator:</span>
                        <span className="font-medium">{selectedEventRequest.coordinator_name}</span>
                      </div>
                    )}
                    {selectedEventRequest.coordinator_contact && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coordinator Contact:</span>
                        <span className="font-medium">{selectedEventRequest.coordinator_contact}</span>
                      </div>
                    )}
                    {selectedEventRequest.media_coverage && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Media Coverage:</span>
                        <span className="font-medium">{selectedEventRequest.media_coverage}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{selectedEventRequest.status_name}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Submitted By</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {getRequesterName(selectedEventRequest)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{getRequesterEmail(selectedEventRequest)}</span>
                    </div>
                    {getRequesterRoll(selectedEventRequest) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roll No:</span>
                        <span className="font-medium">{getRequesterRoll(selectedEventRequest)}</span>
                      </div>
                    )}
                    {selectedEventRequest.society_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Society:</span>
                        <span className="font-medium">{selectedEventRequest.society_name}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Description / Media Coverage */}
              {(selectedEventRequest.description || selectedEventRequest.media_coverage) && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Event Description / Media Coverage</h3>
                  {selectedEventRequest.description && (
                    <p className="text-muted-foreground leading-relaxed mb-3">{selectedEventRequest.description}</p>
                  )}
                  {selectedEventRequest.media_coverage && (
                    <div>
                      <p className="font-medium text-sm mb-1">Media Coverage:</p>
                      <p className="text-muted-foreground leading-relaxed">{selectedEventRequest.media_coverage}</p>
                    </div>
                  )}
                </Card>
              )}

              {/* Participants: Students */}
              {Array.isArray(selectedEventRequest.student_participants) &&
                selectedEventRequest.student_participants.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Student Participants</h3>
                    <div className="space-y-2 text-sm">
                      {selectedEventRequest.student_participants.map((s: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-wrap justify-between border-b last:border-0 pb-2 last:pb-0"
                        >
                          <span className="font-medium">
                            {s.academic_program || "Program not specified"}
                          </span>
                          <span className="text-muted-foreground">
                            {s.semester && `Semester: ${s.semester} • `}
                            {typeof s.no_of_students === "number" && s.no_of_students > 0
                              ? `${s.no_of_students} students`
                              : "Count not specified"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* Participants: Staff */}
              {Array.isArray(selectedEventRequest.staff_participants) &&
                selectedEventRequest.staff_participants.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Staff Participants</h3>
                    <div className="space-y-2 text-sm">
                      {selectedEventRequest.staff_participants.map((s: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-wrap justify-between border-b last:border-0 pb-2 last:pb-0"
                        >
                          <span className="font-medium">
                            {s.department || "Department not specified"}
                          </span>
                          <span className="text-muted-foreground">
                            {s.gazetted || "Category not specified"} •{" "}
                            {typeof s.no_of_staff === "number" && s.no_of_staff > 0
                              ? `${s.no_of_staff} staff`
                              : "Count not specified"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* Management Requirements */}
              {selectedEventRequest.management_requirements && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Management Requirements</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Sound System:</span>{" "}
                        {selectedEventRequest.management_requirements.sound_system ? "Yes" : "No"}
                      </p>
                      <p>
                        <span className="font-medium">Recording:</span>{" "}
                        {selectedEventRequest.management_requirements.recording ? "Yes" : "No"}
                      </p>
                      <p>
                        <span className="font-medium">Bouquet:</span>{" "}
                        {selectedEventRequest.management_requirements.bouquet ? "Yes" : "No"}
                      </p>
                      <p>
                        <span className="font-medium">Souvenirs:</span>{" "}
                        {selectedEventRequest.management_requirements.souvenirs ? "Yes" : "No"}
                      </p>
                      <p>
                        <span className="font-medium">University Photographer:</span>{" "}
                        {selectedEventRequest.management_requirements.university_photographer
                          ? "Yes"
                          : "No"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Special Arrangements:</span>{" "}
                        {selectedEventRequest.management_requirements.special_arrangements
                          ? "Yes"
                          : "No"}
                      </p>
                      {selectedEventRequest.management_requirements.special_arrangements_detail && (
                        <p className="text-muted-foreground">
                          {selectedEventRequest.management_requirements.special_arrangements_detail}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Refreshments:</span>{" "}
                        {selectedEventRequest.management_requirements.refreshment_required
                          ? "Yes"
                          : "No"}
                      </p>
                      {selectedEventRequest.management_requirements.refreshment_required && (
                        <>
                          {selectedEventRequest.management_requirements.refreshment_category && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Category:</span>{" "}
                              {selectedEventRequest.management_requirements.refreshment_category}
                            </p>
                          )}
                          {selectedEventRequest.management_requirements.refreshment_persons && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Persons:</span>{" "}
                              {selectedEventRequest.management_requirements.refreshment_persons} persons
                            </p>
                          )}
                        </>
                      )}
                      {selectedEventRequest.management_requirements.any_other && (
                        <p className="text-muted-foreground">
                          <span className="font-medium">Other:</span>{" "}
                          {selectedEventRequest.management_requirements.any_other}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Transport Requests */}
              {Array.isArray(selectedEventRequest.transport_requests) &&
                selectedEventRequest.transport_requests.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Transport Requests</h3>
                    <div className="space-y-2 text-sm">
                      {selectedEventRequest.transport_requests.map((t: any, idx: number) => (
                        <div
                          key={idx}
                          className="border rounded p-2 flex flex-wrap justify-between gap-2"
                        >
                          <div>
                            <p className="font-medium">{t.vehicle_type || "Vehicle not specified"}</p>
                            <p className="text-muted-foreground">
                              {t.purpose || "Purpose not specified"}
                            </p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            {t.date && <div>📅 {new Date(t.date).toLocaleDateString()}</div>}
                            {t.time && <div>🕐 {t.time}</div>}
                            {t.destination && <div>📍 {t.destination}</div>}
                            {typeof t.no_of_persons === "number" && t.no_of_persons > 0 && (
                              <div>👥 {t.no_of_persons} persons</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* Documents */}
              {Array.isArray(selectedEventRequest.documents) &&
                selectedEventRequest.documents.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Attached Documents</h3>
                    <div className="space-y-2 text-sm">
                      {selectedEventRequest.documents.map((doc: any) => (
                        <div
                          key={doc.doc_id}
                          className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0"
                        >
                          <span>
                            <span className="font-medium capitalize">{doc.doc_type}</span>
                            {" – "}
                            {doc.file_path.split("/").pop()}
                          </span>
                          <a
                            href={`${import.meta.env.VITE_API_URL}${doc.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {/* Admin Notes from History - Grouped by Role */}
              {Array.isArray(selectedEventRequest.status_history) &&
                selectedEventRequest.status_history.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4 text-university-navy">Admin Notes & Status History</h3>
                    <div className="space-y-6">
                      {/* Group notes by role */}
                      {(() => {
                        const notesByRole: { [key: string]: any[] } = {};
                        selectedEventRequest.status_history
                          .filter((h: any) => h.note && h.note.trim() !== "")
                          .forEach((history: any) => {
                            const role = history.role || history.role_display_name || history.role_name || "Admin";
                            if (!notesByRole[role]) {
                              notesByRole[role] = [];
                            }
                            notesByRole[role].push(history);
                          });

                        const roleOrder = ["Board Secretary", "Board President", "Registrar", "VC", "Transport Office", "Protocol Office"];
                        const sortedRoles = Object.keys(notesByRole).sort((a, b) => {
                          const aIndex = roleOrder.indexOf(a);
                          const bIndex = roleOrder.indexOf(b);
                          if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
                          if (aIndex === -1) return 1;
                          if (bIndex === -1) return -1;
                          return aIndex - bIndex;
                        });

                        if (sortedRoles.length === 0) {
                          return <p className="text-sm text-muted-foreground italic">No admin notes yet.</p>;
                        }

                        return sortedRoles.map((role) => (
                          <div key={role} className="space-y-3">
                            <h4 className="font-semibold text-sm text-university-navy border-b pb-2">
                              {role} Notes
                            </h4>
                            {notesByRole[role].map((history: any, idx: number) => (
                              <div
                                key={history.history_id || idx}
                                className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      {history.firstName && history.lastName
                                        ? `${history.firstName} ${history.lastName}`
                                        : role}
                                      {history.status_name && ` • ${history.status_name}`}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(history.changed_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{history.note}</p>
                              </div>
                            ))}
                          </div>
                        ));
                      })()}
                    </div>
                  </Card>
                )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEventRequestModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransportOfficeDashboard;