import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, User, FileText, RefreshCw, History, CheckCircle, XCircle, Eye, Pencil, Lightbulb, X, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { formatTimeToAMPM } from "@/lib/utils";

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
  slot_status_id?: number;
  slot_status_name?: string;
  slot_date?: string;
  slot_time_from?: string;
  slot_time_to?: string;
  slot_request_id?: number;
  cancelled_reason?: string;
  cancelled_at?: string;
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
  role?: string | null;
  note?: string | null;
  changed_at: string;
  firstName: string;
  lastName: string;
  email: string;
  RollNO: string;
  role_name: string;
  role_display_name: string;
}

// Extract displayable note from history - handles JSON remarks like {"role":"...","note":null}
const getDisplayNote = (history: StatusHistory): string | null => {
  let note: string | null = history.note ?? null;
  if (note == null && history.remarks) {
    try {
      const parsed = JSON.parse(history.remarks);
      note = parsed.note ?? null;
    } catch {
      note = history.remarks;
    }
  }
  return (note && String(note).trim() !== "") ? String(note).trim() : null;
};

const EventRequestsList = ({ societyId }: EventRequestsListProps) => {
  const navigate = useNavigate();
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState<any[]>([]);
  const [loadingSuggestedSlots, setLoadingSuggestedSlots] = useState(false);
  const [isSuggestedSlotsModalOpen, setIsSuggestedSlotsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchEventRequests = async () => {
    if (!societyId) return;

    setLoading(true);
    try {
       const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.post(
        `${API_URL}/society/event-request/list`,
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
    setIsHistoryModalOpen(false); // Reset modal state
    try {
       const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        setLoadingHistory(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/society/event-request/${eventReqId}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const historyData = response.data.data || [];
        // Filter out System notes on frontend as well
        const filteredHistory = historyData.filter((history: any) => {
          const role = history.role || history.role_display_name || history.role_name || "";
          return role !== "System" && role !== "SYSTEM";
        });
        setStatusHistory(filteredHistory);
        setIsHistoryModalOpen(true); // Open modal after data is loaded
        setLoadingHistory(false);
      } else {
        toast.error(response.data.message || "Failed to fetch status history");
        setLoadingHistory(false);
      }
    } catch (error: any) {
      console.error("Error fetching status history:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch status history";
      toast.error(errorMessage);
      setLoadingHistory(false);
    }
  };

  // Fetch suggested slots for an event request
  const fetchSuggestedSlots = async (slotRequestId: number) => {
    if (!slotRequestId) return;
    
    setLoadingSuggestedSlots(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Get all suggested slots and filter by slot_request_id
      const response = await axios.get(
        `${API_URL}/admin/protocol/slots/suggested`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Filter suggested slots for this specific slot_request_id
        const filtered = (response.data.data || []).filter(
          (slot: any) => slot.slot_request_id === slotRequestId
        );
        setSuggestedSlots(filtered);
        setIsSuggestedSlotsModalOpen(true);
      }
    } catch (error: any) {
      console.error("Error fetching suggested slots:", error);
    } finally {
      setLoadingSuggestedSlots(false);
    }
  };

  // Check if advisor can edit the request
  const canEdit = (request: EventRequest) => {
    if (!request) return false;

    // If event is rejected by any admin (3, 5, 7, 9, 12, 14), cannot edit
    // Note: Status 16 (Revise by Board President) is NOT a rejection - it allows editing
    const eventRejected = [3, 5, 7, 9, 12, 14].includes(request.status_id);
    if (eventRejected) {
      return false;
    }

    // Check if slot is REJECTED (3) or SUGGESTED (4) - can edit
    const slotRejectedOrSuggested = request.slot_status_id === 3 || request.slot_status_id === 4;

    // Check if event status is REVISE (15, 16, 17, 18) - can edit
    const eventRevise = [15, 16, 17, 18].includes(request.status_id);

    // Check if event status is PENDING (1) - can edit
    const eventPending = request.status_id === 1;

    return slotRejectedOrSuggested || eventRevise || eventPending;
  };

  // Handle edit request
  const handleEditRequest = (reqId: number) => {
    navigate(`/dashboard/society/event-request/edit/${reqId}`);
  };

  // Handle cancel request
  const handleCancelRequest = (request: EventRequest) => {
    setSelectedRequest(request);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  // Submit cancel request
  const submitCancelRequest = async () => {
    if (!selectedRequest || !cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      setCancelling(true);
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.post(
        `${API_URL}/society/event-request/cancel`,
        {
          req_id: selectedRequest.req_id,
          cancelled_reason: cancelReason.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Event request cancelled successfully");
        setIsCancelModalOpen(false);
        setCancelReason("");
        setSelectedRequest(null);
        fetchEventRequests();
      }
    } catch (error: any) {
      console.error("Error cancelling event request:", error);
      toast.error(error.response?.data?.message || "Failed to cancel event request");
    } finally {
      setCancelling(false);
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
                    {request.slot_status_name && (
                      <Badge 
                        variant={
                          request.slot_status_id === 2 ? "default" :
                          request.slot_status_id === 3 ? "destructive" :
                          request.slot_status_id === 4 ? "secondary" :
                          "outline"
                        }
                        className={
                          request.slot_status_id === 2 ? "bg-green-100 text-green-800 border-green-200" :
                          request.slot_status_id === 3 ? "bg-red-100 text-red-800 border-red-200" :
                          request.slot_status_id === 4 ? "bg-blue-100 text-blue-800 border-blue-200" :
                          "bg-yellow-100 text-yellow-800 border-yellow-200"
                        }
                      >
                        Slot: {request.slot_status_name}
                      </Badge>
                    )}
                    {request.status_description && (
                      <span className="text-xs text-muted-foreground">
                        ({request.status_description})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
                  
                  {/* Slot Information */}
                  {request.slot_date && (
                    <div className="bg-blue-50 border-l-4 border-blue-200 p-3 mb-4 rounded">
                      <p className="text-sm font-medium text-blue-900 mb-1">Current Slot:</p>
                      <div className="flex flex-wrap gap-4 text-xs text-blue-800">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.slot_date).toLocaleDateString()}
                        </span>
                        {request.slot_time_from && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeToAMPM(request.slot_time_from)}
                            {request.slot_time_to && <> - {formatTimeToAMPM(request.slot_time_to)}</>}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2 text-university-navy" />
                  <span>{new Date(request.event_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2 text-university-navy" />
                  <span>{request.event_time ? formatTimeToAMPM(request.event_time) : request.time_from ? formatTimeToAMPM(request.time_from) : "N/A"}</span>
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

              {request.cancelled_reason && (
                <div className="bg-red-50 border-l-4 border-red-200 p-3 mb-4 rounded">
                  <p className="text-sm font-medium text-red-900 mb-1">Cancellation Reason:</p>
                  <p className="text-sm text-red-800">{request.cancelled_reason}</p>
                  {request.cancelled_at && (
                    <p className="text-xs text-red-600 mt-1">
                      Cancelled on: {new Date(request.cancelled_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Submitted: {new Date(request.created_at).toLocaleString()}</span>
                  {request.updated_at && (
                    <span>• Updated: {new Date(request.updated_at).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!request.cancelled_reason && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                  {canEdit(request) && (
                          <DropdownMenuItem
                      onClick={() => handleEditRequest(request.req_id)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Request
                          </DropdownMenuItem>
                        )}
                        {request.slot_request_id && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRequest(request);
                              fetchSuggestedSlots(request.slot_request_id);
                            }}
                            disabled={loadingSuggestedSlots}
                          >
                            <Lightbulb className="h-4 w-4 mr-2" />
                            View Suggested Slots
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRequest(request);
                            fetchStatusHistory(request.req_id);
                          }}
                          disabled={loadingHistory}
                        >
                          <History className="h-4 w-4 mr-2" />
                          View Status History
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancelRequest(request)}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Request
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {request.cancelled_reason && (
                    <>
                  {request.slot_request_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        fetchSuggestedSlots(request.slot_request_id);
                      }}
                      disabled={loadingSuggestedSlots}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      View Suggested Slots
                    </Button>
                  )}
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
                    </>
                  )}
                </div>
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
            <div className="space-y-6">
              {/* Group notes by role */}
              {(() => {
                const notesByRole: { [key: string]: StatusHistory[] } = {};
                const historyWithoutNotes: StatusHistory[] = [];
                
                statusHistory.forEach((history) => {
                  const displayNote = getDisplayNote(history);
                  const role = history.role || history.role_display_name || history.role_name || "Admin";

                  // Filter out System notes - only show admin and protocol notes
                  if (role === "System" || role === "SYSTEM") {
                    return; // Skip system notes
                  }

                  if (displayNote) {
                    if (!notesByRole[role]) {
                      notesByRole[role] = [];
                    }
                    notesByRole[role].push(history);
                  } else {
                    historyWithoutNotes.push(history);
                  }
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

                return (
                  <>
                    {/* Display notes grouped by role */}
                    {sortedRoles.map((role) => (
                      <div key={role} className="space-y-3">
                        <h4 className="font-semibold text-sm text-university-navy border-b pb-2">
                          {role} Notes
                        </h4>
                        {notesByRole[role].map((history) => (
                          <Card key={history.history_id} className="p-4 shadow-card border-l-4 border-l-blue-500">
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
                                </div>
                                
                                <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded mb-2">
                                  <p className="text-sm text-blue-800">{getDisplayNote(history) || "—"}</p>
                                </div>

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
                    ))}
                    
                    {/* Display status changes without notes */}
                    {historyWithoutNotes.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-university-navy border-b pb-2">
                          Status Changes
                        </h4>
                        {historyWithoutNotes.map((history) => (
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
                    )}
                  </>
                );
              })()}
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

      {/* Suggested Slots Modal */}
      <Dialog open={isSuggestedSlotsModalOpen} onOpenChange={(open) => {
        setIsSuggestedSlotsModalOpen(open);
        if (!open) {
          setSuggestedSlots([]);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-university-navy">
              Suggested Slots
            </DialogTitle>
            <DialogDescription>
              Alternative slots suggested by Protocol Office for: <strong>{selectedRequest?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          {loadingSuggestedSlots ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading suggested slots...</p>
            </div>
          ) : suggestedSlots.length > 0 ? (
            <div className="space-y-4">
              {suggestedSlots.map((slot: any) => (
                <Card key={slot.suggestion_id} className="p-4 shadow-card border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          {slot.slot_status_name}
                        </Badge>
                        {slot.venue_name && (
                          <Badge variant="outline">{slot.venue_name}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                        {slot.slot_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(slot.slot_date).toLocaleDateString()}
                          </span>
                        )}
                        {slot.slot_time_from && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTimeToAMPM(slot.slot_time_from)}
                            {slot.slot_time_to && <> - {formatTimeToAMPM(slot.slot_time_to)}</>}
                          </span>
                        )}
                      </div>
                      {slot.note && (
                        <div className="bg-blue-50 border-l-4 border-blue-200 p-2 mt-2 rounded">
                          <p className="text-xs font-medium text-blue-900 mb-1">Note:</p>
                          <p className="text-xs text-blue-800">{slot.note}</p>
                        </div>
                      )}
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Suggested: {new Date(slot.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Suggested Slots</h3>
              <p className="text-muted-foreground">
                No alternative slots have been suggested for this event request yet.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Request Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-university-navy">
              Cancel Event Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this event request? Please provide a reason for cancellation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="cancelReason" className="text-sm font-medium">
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="cancelReason"
                placeholder="Please provide a reason for cancelling this event request..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            {selectedRequest && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium mb-1">Event Request:</p>
                <p className="text-sm text-muted-foreground">{selectedRequest.title}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelModalOpen(false);
                setCancelReason("");
                setSelectedRequest(null);
              }}
              disabled={cancelling}
            >
              Cancel
            </Button>
            <Button
              onClick={submitCancelRequest}
              disabled={cancelling || !cancelReason.trim()}
              variant="destructive"
            >
              {cancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Request
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventRequestsList;

