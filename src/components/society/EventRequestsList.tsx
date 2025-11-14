import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, User, FileText, RefreshCw, History, CheckCircle, XCircle, Eye } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface EventRequest {
  req_id: number;
  society_id: number;
  submitted_by: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  status_id: number;
  status_name: string;
  status_description?: string;
  note?: string;
  created_at: string;
  updated_at?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  rollNo?: string;
  society_name?: string;
}

interface EventRequestsListProps {
  societyId: number;
}

interface StatusHistory {
  history_id: number;
  event_req_id: number;
  status_id: number;
  status_name: string;
  status_description: string;
  remarks: string | null;
  changed_at: string;
  firstName: string;
  lastName: string;
  email: string;
  RollNO: string;
  role_name: string;
  role_display_name: string;
}

const EventRequestsList = ({ societyId }: EventRequestsListProps) => {
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchEventRequests = async () => {
    if (!societyId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/society/event-request/list",
        { society_id: societyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setEventRequests(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch event requests");
        setEventRequests([]);
      }
    } catch (error: any) {
      console.error("Error fetching event requests:", error);
      toast.error(error.response?.data?.message || "Failed to fetch event requests");
      setEventRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventRequests();
  }, [societyId]);

  // Fetch status history for an event request
  const fetchStatusHistory = async (eventReqId: number) => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/society/event-request/${eventReqId}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStatusHistory(response.data.data || []);
        setIsHistoryModalOpen(true);
      } else {
        toast.error(response.data.message || "Failed to fetch status history");
      }
    } catch (error: any) {
      console.error("Error fetching status history:", error);
      toast.error(error.response?.data?.message || "Failed to fetch status history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadge = (statusId: number, statusName: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let className = "";

    if (statusId === 1) {
      variant = "secondary";
      className = "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else if ([2, 4, 6, 8, 10, 11].includes(statusId)) {
      variant = "default";
      className = "bg-green-100 text-green-800 border-green-200";
    } else if ([3, 5, 7, 9].includes(statusId)) {
      variant = "destructive";
      className = "bg-red-100 text-red-800 border-red-200";
    } else {
      variant = "default";
      className = "bg-blue-100 text-blue-800 border-blue-200";
    }

    return (
      <Badge variant={variant} className={className}>
        {statusName || `Status ${statusId}`}
      </Badge>
    );
  };

  if (loading && eventRequests.length === 0) {
    return (
      <Card className="p-6 shadow-card">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event requests...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-university-navy" />
          <h2 className="text-xl font-semibold text-university-navy">Event Requests</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEventRequests}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {eventRequests.length === 0 ? (
        <Card className="p-6 shadow-card">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-university-navy mb-2">No Event Requests</h3>
            <p className="text-sm text-muted-foreground">
              You haven't submitted any event requests yet. Submit your first event request above.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {eventRequests.map((request) => (
            <Card key={request.req_id} className="p-6 shadow-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-university-navy">{request.title}</h3>
                    {getStatusBadge(request.status_id || 1, request.status_name || 'Pending')}
                    {request.status_description && (
                      <span className="text-xs text-muted-foreground">
                        ({request.status_description})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2 text-university-navy" />
                  <span>{new Date(request.event_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2 text-university-navy" />
                  <span>{request.event_time}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 text-university-navy" />
                  <span>{request.venue}</span>
                </div>
                {request.firstName && request.lastName && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2 text-university-navy" />
                    <span>{request.firstName} {request.lastName}</span>
                  </div>
                )}
              </div>

              {request.note && (
                <div className="bg-blue-50 border-l-4 border-blue-200 p-3 mb-4 rounded">
                  <p className="text-sm font-medium text-blue-900 mb-1">Latest Admin Note:</p>
                  <p className="text-sm text-blue-800">{request.note}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Submitted: {new Date(request.created_at).toLocaleString()}</span>
                  {request.updated_at && (
                    <span>• Updated: {new Date(request.updated_at).toLocaleString()}</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    fetchStatusHistory(request.req_id);
                  }}
                  disabled={loadingHistory}
                >
                  <History className="h-4 w-4 mr-2" />
                  View Status History
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Status History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-university-navy">
              Event Request Status History
            </DialogTitle>
            <DialogDescription>
              Complete status history for: <strong>{selectedRequest?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          {loadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading status history...</p>
            </div>
          ) : statusHistory.length > 0 ? (
            <div className="space-y-4">
              {statusHistory.map((history, index) => (
                <Card key={history.history_id} className="p-4 shadow-card border-l-4 border-l-university-navy">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={
                            [2, 4, 6, 8, 10, 11].includes(history.status_id) ? "default" : 
                            [3, 5, 7, 9].includes(history.status_id) ? "destructive" : 
                            "secondary"
                          }
                          className={
                            [2, 4, 6, 8, 10, 11].includes(history.status_id) 
                              ? "bg-green-100 text-green-800 border-green-200" : 
                            [3, 5, 7, 9].includes(history.status_id)
                              ? "bg-red-100 text-red-800 border-red-200" :
                              "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }
                        >
                          {history.status_name}
                        </Badge>
                        {history.role_display_name && (
                          <Badge variant="outline" className="text-xs">
                            {history.role_display_name}
                          </Badge>
                        )}
                      </div>
                      
                      {history.status_description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {history.status_description}
                        </p>
                      )}

                      {history.remarks && (
                        <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded mb-2">
                          <p className="text-xs font-medium text-blue-900 mb-1">Note:</p>
                          <p className="text-sm text-blue-800">{history.remarks}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          <span>
                            {history.firstName} {history.lastName}
                            {history.RollNO && ` (${history.RollNO})`}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{new Date(history.changed_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {[2, 4, 6, 8, 10, 11].includes(history.status_id) ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : [3, 5, 7, 9].includes(history.status_id) ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Status History</h3>
              <p className="text-muted-foreground">
                No status changes have been recorded for this event request yet.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventRequestsList;

