import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, FileText, Send } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface EventRequestFormProps {
  societyId: number;
  userId: number;
  onSubmitSuccess?: () => void;
  showCard?: boolean; // Option to show/hide the Card wrapper
}

const EventRequestForm = ({ societyId, userId, onSubmitSuccess, showCard = true }: EventRequestFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    venue: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter event title");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter event description");
      return;
    }
    if (!formData.event_date) {
      toast.error("Please select event date");
      return;
    }
    if (!formData.event_time) {
      toast.error("Please enter event time");
      return;
    }
    if (!formData.venue.trim()) {
      toast.error("Please enter venue");
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error("Event date cannot be in the past");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/society/event-request/create",
        {
          society_id: societyId,
          submitted_by: userId,
          title: formData.title,
          description: formData.description,
          event_date: formData.event_date,
          event_time: formData.event_time,
          venue: formData.venue
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Event request submitted successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          event_date: "",
          event_time: "",
          venue: ""
        });
        
        // Call success callback
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        toast.error(response.data.message || "Failed to submit event request");
      }
    } catch (error: any) {
      console.error("Error submitting event request:", error);
      toast.error(error.response?.data?.message || "Failed to submit event request");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formContent = (
    <>
      {showCard && (
        <div className="flex items-center mb-6">
          <FileText className="h-5 w-5 mr-2 text-university-navy" />
          <h2 className="text-xl font-semibold text-university-navy">Submit Event Request</h2>
        </div>
      )}

      <form onSubmit={handleSubmit} className={showCard ? "space-y-6" : "space-y-4"}>
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            name="title"
            type="text"
            placeholder="e.g., Tech Innovation Summit 2024"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Event Description *</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Provide a detailed description of the event..."
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full"
          />
        </div>

        {/* Date and Time */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event_date">Event Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="event_date"
                name="event_date"
                type="date"
                value={formData.event_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_time">Event Time *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="event_time"
                name="event_time"
                type="time"
                value={formData.event_time}
                onChange={handleChange}
                required
                className="w-full pl-10"
              />
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label htmlFor="venue">Venue *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="venue"
              name="venue"
              type="text"
              placeholder="e.g., University Auditorium, Computer Lab 301"
              value={formData.venue}
              onChange={handleChange}
              required
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="university"
            size="lg"
            disabled={loading}
            className="min-w-[150px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );

  if (showCard) {
    return <Card className="p-6 shadow-card">{formContent}</Card>;
  }

  return <div className="space-y-6">{formContent}</div>;
};

export default EventRequestForm;

