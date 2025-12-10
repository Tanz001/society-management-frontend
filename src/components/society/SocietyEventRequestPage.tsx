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
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        let response;

        // Priority 1: Check localStorage for stored society ID
        const storedSocietyId = localStorage.getItem("currentSocietyId");
        if (storedSocietyId) {
          console.log("Fetching society data for event request page using stored ID:", storedSocietyId);
          response = await axios.get(
            `${API_URL}/society/society/data/${storedSocietyId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          // Priority 2: Fetch by user_id (for society owners)
          const storedUser = localStorage.getItem("user");
          if (!storedUser) {
            setLoading(false);
            return;
          }

          const userData = JSON.parse(storedUser);
          const userId = userData.id;

          if (!userId) {
            setLoading(false);
            return;
          }

          response = await axios.post(
            `${API_URL}/society/society/data`,
            { user_id: userId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        if (response.data.success) {
          // Handle both array and single object responses
          let societyData = null;
          if (Array.isArray(response.data.society)) {
            societyData = response.data.society.length > 0 ? response.data.society[0] : null;
          } else if (response.data.society) {
            societyData = response.data.society;
          }
          
          setSocietyInfo(societyData);
          
          // Store society ID in localStorage if we got it
          if (societyData && societyData.society_id) {
            localStorage.setItem("currentSocietyId", societyData.society_id.toString());
          }
        } else {
          console.error("Failed to fetch society data:", response.data.message);
          // Still try to set loading to false even if response is not successful
        }
      } catch (error: any) {
        console.error("Error fetching society data for event request page:", error);
        console.error("Error details:", error.response?.data || error.message);
        // Don't prevent the form from showing if we have stored data
      } finally {
        setLoading(false);
      }
    };

    fetchSocietyData();
  }, []);

  const storedUser = localStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  // Support both student (id) and faculty (faculty_id) users
  const userId = userData?.id || userData?.faculty_id;

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 px-0 text-white hover:bg-white/20 border border-white/30 bg-black/20 backdrop-blur-sm"
              onClick={() => {
                // Get stored society ID and navigate to dashboard with it
                const storedSocietyId = localStorage.getItem("currentSocietyId");
                if (storedSocietyId) {
                  navigate(`/dashboard/society/${storedSocietyId}`);
                } else {
                  navigate("/dashboard/society");
                }
              }}
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
            <div className="text-center py-10 space-y-4">
              <p className="text-sm text-muted-foreground">
                Unable to load society information. Please return to the dashboard and try again.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                {!societyInfo && <p>• Society information not found</p>}
                {!userId && <p>• User ID not found</p>}
                <p className="mt-2">Debug info: {localStorage.getItem("currentSocietyId") ? `Stored ID: ${localStorage.getItem("currentSocietyId")}` : "No stored ID"}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const storedSocietyId = localStorage.getItem("currentSocietyId");
                  if (storedSocietyId) {
                    navigate(`/dashboard/society/${storedSocietyId}`);
                  } else {
                    navigate("/dashboard/society");
                  }
                }}
              >
                Return to Dashboard
              </Button>
            </div>
          )}

          {!loading && societyInfo && (
            <EventRequestForm
              societyId={societyInfo.society_id}
              userId={userId || undefined}
              onSubmitSuccess={() => {
                // Get stored society ID and navigate to dashboard with it
                const storedSocietyId = localStorage.getItem("currentSocietyId");
                if (storedSocietyId) {
                  navigate(`/dashboard/society/${storedSocietyId}`);
                } else {
                  navigate("/dashboard/society");
                }
              }}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default SocietyEventRequestPage;



