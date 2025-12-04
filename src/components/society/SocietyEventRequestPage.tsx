import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import EventRequestForm from "./EventRequestForm";
import axios from "axios";

interface SocietyInfo {
  society_id: number;
  name?: string;
}

const SocietyEventRequestPage = () => {
  const [societyInfo, setSocietyInfo] = useState<SocietyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSocietyData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        const userId = userData.id;

        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/society/society/data`,
          { user_id: userId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          const societyData =
            response.data.society && response.data.society.length > 0
              ? response.data.society[0]
              : null;
          setSocietyInfo(societyData);
        }
      } catch (error) {
        console.error("Error fetching society data for event request page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocietyData();
  }, []);

  const storedUser = localStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const userId = userData?.id;

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 px-0"
              onClick={() => navigate("/dashboard/society")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-semibold">
              Create Event Request
            </h1>
            <p className="text-sm text-muted-foreground">
              Submit a detailed request for your upcoming society event.
            </p>
          </div>
        </div>

        <Card className="p-4 md:p-6">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <span>Loading society information...</span>
            </div>
          )}

          {!loading && (!societyInfo || !userId) && (
            <div className="text-center py-10 text-sm text-muted-foreground">
              Unable to load society information. Please return to the dashboard and try again.
            </div>
          )}

          {!loading && societyInfo && userId && (
            <EventRequestForm
              societyId={societyInfo.society_id}
              userId={userId}
              onSubmitSuccess={() => navigate("/dashboard/society")}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default SocietyEventRequestPage;



