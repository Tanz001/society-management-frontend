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
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProtocolOfficeDashboard = () => {
  const [eventRequests, setEventRequests] = useState([]);
  const [selectedEventRequest, setSelectedEventRequest] = useState(null);
  const [isEventRequestModalOpen, setIsEventRequestModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    if ([2, 4, 6, 8, 11, 13, 15].includes(statusId)) return "default"; // Approved statuses
    if ([3, 5, 7, 9, 12, 14].includes(statusId)) return "destructive"; // Rejected statuses
    return "outline";
  };

  // Fetch all event requests (read-only view)
  const fetchAllEventRequests = async () => {
    try {
      setLoading(true);
      setError("");
  
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      const response = await axios.post(
        "http://localhost:5000/admin/event-requests",
        { role: "protocol_office_view" }, // Special role for read-only view
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
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`http://localhost:5000/admin/event-requests/${reqId}`, {
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

  useEffect(() => {
    fetchAllEventRequests();
  }, []);

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
                Protocol Office Dashboard
              </h1>
              <p className="text-white/80">View All Event Protocol Requests</p>
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
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold text-university-navy">{eventRequests.length}</p>
                </div>
                <FileText className="h-8 w-8 text-university-navy" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">All event requests</p>
            </Card>

            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-university-navy">
                    {eventRequests.filter(r => r.status_id === 1).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Awaiting review</p>
            </Card>

            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-university-navy">
                    {eventRequests.filter(r => [2, 4, 6, 8, 11, 13, 15].includes(r.status_id)).length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">In approval process</p>
            </Card>

            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-university-navy">
                    {eventRequests.filter(r => [3, 5, 7, 9, 12, 14].includes(r.status_id)).length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Rejected requests</p>
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
            <DialogTitle>Event Request Details (Read-Only)</DialogTitle>
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
                      <span className="text-muted-foreground">Event Date:</span>
                      <span className="font-medium">{new Date(selectedEventRequest.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Time:</span>
                      <span className="font-medium">{selectedEventRequest.event_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span className="font-medium">{selectedEventRequest.venue}</span>
                    </div>
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

              {/* Description */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy">Event Description</h3>
                <p className="text-muted-foreground leading-relaxed">{selectedEventRequest.description}</p>
              </Card>

              {/* Note */}
              {selectedEventRequest.note && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold mb-3 text-university-navy">Admin Note</h3>
                  <p className="text-muted-foreground italic">{selectedEventRequest.note}</p>
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

export default ProtocolOfficeDashboard;