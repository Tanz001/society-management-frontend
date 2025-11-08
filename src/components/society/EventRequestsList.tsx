import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, FileText, RefreshCw } from "lucide-react";
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

const EventRequestsList = ({ societyId }: EventRequestsListProps) => {
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(false);

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

  const getStatusBadge = (statusId: number, statusName: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let className = "";

    if (statusId === 1) {
      variant = "secondary";
      className = "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else if (statusId === 6) {
      variant = "default";
      className = "bg-green-100 text-green-800 border-green-200";
    } else if ([3, 5, 7].includes(statusId)) {
      variant = "destructive";
      className = "bg-red-100 text-red-800 border-red-200";
    } else {
      variant = "default";
      className = "bg-blue-100 text-blue-800 border-blue-200";
    }

    return (
      <Badge variant={variant} className={className}>
        {statusName}
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
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-university-navy">{request.title}</h3>
                    {getStatusBadge(request.status_id, request.status_name)}
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
                  <p className="text-sm font-medium text-blue-900 mb-1">Admin Note:</p>
                  <p className="text-sm text-blue-800">{request.note}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                <span>Submitted: {new Date(request.created_at).toLocaleString()}</span>
                {request.updated_at && (
                  <span>Updated: {new Date(request.updated_at).toLocaleString()}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventRequestsList;

