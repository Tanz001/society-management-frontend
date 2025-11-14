import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, FileText, Building, Users, Eye, MapPin } from "lucide-react";

interface AdminEventReportsSectionProps {
  isActive: boolean;
}

const AdminEventReportsSection = ({ isActive }: AdminEventReportsSectionProps) => {
  const [eventReports, setEventReports] = useState<any[]>([]);
  const [loadingEventReports, setLoadingEventReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loadingReportDetails, setLoadingReportDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllEventReports = useCallback(async () => {
    try {
      setLoadingEventReports(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get("http://localhost:5000/admin/event-reports", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEventReports(response.data.data || response.data.eventReports || []);
    } catch (err: any) {
      console.error("Error fetching event reports:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch event reports");
      setEventReports([]);
    } finally {
      setLoadingEventReports(false);
    }
  }, []);

  const handleViewReport = useCallback(
    async (reportId: number) => {
      try {
        setLoadingReportDetails(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(`http://localhost:5000/admin/event-reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSelectedReport(response.data.data);
        setIsReportModalOpen(true);
      } catch (err: any) {
        console.error("Error fetching event report details:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch event report details");
      } finally {
        setLoadingReportDetails(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isActive && eventReports.length === 0 && !loadingEventReports) {
      fetchAllEventReports();
    }
  }, [isActive, fetchAllEventReports, eventReports.length, loadingEventReports]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-university-navy">Event Reports</h2>
        <Button variant="outline" onClick={fetchAllEventReports} disabled={loadingEventReports}>
          {loadingEventReports ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-4 border border-red-200 bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {loadingEventReports && eventReports.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event reports...</p>
        </div>
      ) : eventReports.length > 0 ? (
        <div className="grid gap-6">
          {eventReports.map((report) => (
            <Card
              key={report.report_id}
              className="p-6 shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-university-gold"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3 flex-wrap gap-2">
                    <h3 className="text-xl font-semibold text-university-navy">{report.report_title}</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <FileText className="h-3 w-3 mr-1" />
                      Report Submitted
                    </Badge>
                  </div>

                  {report.report_description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{report.report_description}</p>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Event: </span>
                        <span className="font-medium ml-1">{report.event_title}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Society: </span>
                        <span className="font-medium ml-1">{report.society_name}</span>
                      </div>
                      {report.event_date && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">Event Date: </span>
                          <span className="font-medium ml-1">{new Date(report.event_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Submitted by: </span>
                        <span className="font-medium ml-1">
                          {report.firstName} {report.lastName}
                        </span>
                      </div>
                      {report.RollNO && (
                        <div className="flex items-center text-sm">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">Roll No: </span>
                          <span className="font-medium ml-1">{report.RollNO}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Submitted: </span>
                        <span className="font-medium ml-1">{new Date(report.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    size="sm"
                    variant="university"
                    onClick={() => handleViewReport(report.report_id)}
                    disabled={loadingReportDetails}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {loadingReportDetails ? "Loading..." : "View Report"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`http://localhost:5000/${report.report_file}`, "_blank")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Event Reports Found</h3>
          <p className="text-muted-foreground">No event reports have been submitted yet.</p>
        </div>
      )}

      {/* Event Report Detail Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-4xl h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-university-navy">Event Report Details</DialogTitle>
            <DialogDescription>Complete information about the submitted event report</DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6 overflow-y-auto h-full">
              <div className="gradient-primary text-white p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2 flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {selectedReport.event_status}
                      </Badge>
                      {selectedReport.society_name && (
                        <Badge variant="outline" className="text-white border-white">
                          {selectedReport.society_name}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{selectedReport.report_title}</h2>
                    <p className="text-white/90 mb-4">{selectedReport.event_title}</p>
                    <div className="flex items-center flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {selectedReport.event_date ? new Date(selectedReport.event_date).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      {selectedReport.event_time && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{selectedReport.event_time}</span>
                        </div>
                      )}
                      {selectedReport.venue && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedReport.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Report Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Report Title:</span>
                      <span className="font-medium">{selectedReport.report_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="font-medium">{new Date(selectedReport.submitted_at).toLocaleString()}</span>
                    </div>
                    {selectedReport.updated_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="font-medium">{new Date(selectedReport.updated_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Submitted By</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedReport.firstName} {selectedReport.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedReport.email}</span>
                    </div>
                    {selectedReport.RollNO && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roll No:</span>
                        <span className="font-medium">{selectedReport.RollNO}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {selectedReport.report_description && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Report Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedReport.report_description}</p>
                </Card>
              )}

              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy">Report File</h3>
                <Button
                  variant="outline"
                  onClick={() => window.open(`http://localhost:5000/${selectedReport.report_file}`, "_blank")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminEventReportsSection;

