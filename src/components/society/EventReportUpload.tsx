import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, FileText, Building, User } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface EventReportUploadProps {
  eventId: number;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EventReportUpload = ({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  onSuccess,
}: EventReportUploadProps) => {
  const [formContext, setFormContext] = useState<{
    society_name: string;
    advisor_name: string;
    event_title?: string;
    event_date?: string;
    event_time?: string;
  } | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [presidentName, setPresidentName] = useState("");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDetails, setActivityDetails] = useState("");
  const [attendanceDetails, setAttendanceDetails] = useState("");
  const [keyTakeaways, setKeyTakeaways] = useState("");
  const [discourseGist, setDiscourseGist] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (isOpen && eventId) {
      setLoadingContext(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingContext(false);
        return;
      }
      axios
        .get(`${API_URL}/society/event-report/context/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success && res.data.data) {
            setFormContext(res.data.data);
          }
        })
        .catch(() => {
          toast.error("Could not load form context");
          setFormContext(null);
        })
        .finally(() => setLoadingContext(false));
    }
  }, [isOpen, eventId, API_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !activityTitle.trim()) {
      toast.error("Activity title is required");
      return;
    }
    if (!presidentName.trim()) {
      toast.error("President name is required");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}/society/activity-report/upload`,
        {
          event_req_id: eventId,
          president_name: presidentName.trim(),
          activity_title: activityTitle.trim(),
          activity_details: activityDetails.trim() || undefined,
          attendance_details: attendanceDetails.trim() || undefined,
          key_takeaways: keyTakeaways.trim() || undefined,
          discourse_gist: discourseGist.trim() || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        toast.success("Activity report submitted successfully!");
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPresidentName("");
    setActivityTitle("");
    setActivityDetails("");
    setAttendanceDetails("");
    setKeyTakeaways("");
    setDiscourseGist("");
  };

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      setFormContext(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-university-navy">
            Submit Activity Report
          </DialogTitle>
          <DialogDescription>
            Submit an activity report for: <strong>{eventTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        {loadingContext ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-university-navy" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only context */}
            {formContext && (
              <div className="grid gap-4 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Society:</span>
                  <span className="font-medium">{formContext.society_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Advisor:</span>
                  <span className="font-medium">{formContext.advisor_name || "—"}</span>
                </div>
              </div>
            )}

            {/* President Name */}
            <div className="space-y-2">
              <Label htmlFor="president_name" className="text-sm font-semibold">
                President Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="president_name"
                placeholder="Society president / head name"
                value={presidentName}
                onChange={(e) => setPresidentName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Activity Title */}
            <div className="space-y-2">
              <Label htmlFor="activity_title" className="text-sm font-semibold">
                Activity Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="activity_title"
                placeholder="e.g., Annual Tech Conference 2024"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Activity Details */}
            <div className="space-y-2">
              <Label htmlFor="activity_details" className="text-sm font-semibold">
                Activity Details
              </Label>
              <Textarea
                id="activity_details"
                placeholder="Describe the activity, agenda, and main points..."
                value={activityDetails}
                onChange={(e) => setActivityDetails(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Attendance Details */}
            <div className="space-y-2">
              <Label htmlFor="attendance_details" className="text-sm font-semibold">
                Attendance Details
              </Label>
              <Textarea
                id="attendance_details"
                placeholder="Number of participants, demographics, notable attendees..."
                value={attendanceDetails}
                onChange={(e) => setAttendanceDetails(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2">
              <Label htmlFor="key_takeaways" className="text-sm font-semibold">
                Key Takeaways
              </Label>
              <Textarea
                id="key_takeaways"
                placeholder="Main outcomes, learnings, and impact..."
                value={keyTakeaways}
                onChange={(e) => setKeyTakeaways(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Discourse Gist */}
            <div className="space-y-2">
              <Label htmlFor="discourse_gist" className="text-sm font-semibold">
                Discourse Gist
              </Label>
              <Textarea
                id="discourse_gist"
                placeholder="Summary of discussions, feedback, or notable quotes..."
                value={discourseGist}
                onChange={(e) => setDiscourseGist(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="university"
                disabled={submitting || !activityTitle.trim() || !presidentName.trim()}
                className="min-w-[140px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventReportUpload;
