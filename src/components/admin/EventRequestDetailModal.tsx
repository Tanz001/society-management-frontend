import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    FileText,
    XCircle
} from "lucide-react";
import { formatTimeToAMPM } from "@/lib/utils";

interface EventRequestDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventRequest: any | null;
    actionContent?: React.ReactNode;
}

const EventRequestDetailModal: React.FC<EventRequestDetailModalProps> = ({
    isOpen,
    onClose,
    eventRequest,
    actionContent
}) => {
    if (!eventRequest) return null;

    // Helper functions specific to this view
    const getRequesterName = (request: any) => {
        if (!request) return "Not available";
        // Priority: Advisor name
        if (request.advisor_name) return request.advisor_name;
        // Fallback: Student name
        const name = `${request.firstName || ""} ${request.lastName || ""}`.trim();
        if (name) return name;
        if (request.president_name) return request.president_name;
        if (request.submitted_by_name) return request.submitted_by_name;
        return "Not available";
    };

    const getRequesterEmail = (request: any) => {
        if (!request) return "Not provided";
        // Priority: Advisor email
        if (request.advisor_email) return request.advisor_email;
        // Fallback: Student email
        return request.email || request.president_email || request.submitted_by_email || "Not provided";
    };

    const getRequesterRoll = (request: any) => {
        if (!request) return null;
        // Only show roll number for students, not advisors
        return request.rollNo || request.RollNO || request.student_rollno || request.submitted_by_rollno || null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[95vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Event Request Details</DialogTitle>
                    <DialogDescription>
                        Complete information about the event request
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Header Section */}
                    <div className="gradient-primary text-white p-6 rounded-lg shadow-md">
                        <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-12 w-12 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center mb-2 flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                                        {eventRequest.status_name}
                                    </Badge>
                                    {eventRequest.society_name && (
                                        <Badge variant="outline" className="text-white border-white">
                                            {eventRequest.society_name}
                                        </Badge>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold mb-2">{eventRequest.title || eventRequest.event_name}</h2>
                                <p className="text-white/90 mb-4">{eventRequest.description}</p>
                                <div className="flex items-center flex-wrap gap-4 text-sm">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(eventRequest.date_from || eventRequest.event_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            {eventRequest.time_from
                                                ? formatTimeToAMPM(eventRequest.time_from)
                                                : eventRequest.event_time
                                                    ? formatTimeToAMPM(eventRequest.event_time)
                                                    : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{eventRequest.venue || eventRequest.venue_name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Notice */}
                    {eventRequest.cancelled_reason && (
                        <Card className="p-4 shadow-sm border-l-4 border-l-red-500 bg-red-50">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-2 text-red-900 flex items-center gap-2">
                                        Event Request Cancelled
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm font-medium text-red-800 mb-1">Cancellation Reason:</p>
                                            <p className="text-sm text-red-700 bg-white/50 p-3 rounded border border-red-200">
                                                {eventRequest.cancelled_reason}
                                            </p>
                                        </div>
                                        {eventRequest.cancelled_at && (
                                            <p className="text-xs text-red-600">
                                                Cancelled on: {new Date(eventRequest.cancelled_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="p-4 shadow-sm border-slate-200">
                            <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2">Event Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Event Name:</span>
                                    <span className="font-medium text-slate-900">{eventRequest.event_name || eventRequest.title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Event Type:</span>
                                    <span className="font-medium text-slate-900">{eventRequest.event_type || "Not specified"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date From:</span>
                                    <span className="font-medium text-slate-900">
                                        {eventRequest.date_from
                                            ? new Date(eventRequest.date_from).toLocaleDateString()
                                            : eventRequest.event_date
                                                ? new Date(eventRequest.event_date).toLocaleDateString()
                                                : "Not specified"}
                                    </span>
                                </div>
                                {eventRequest.date_to && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date To:</span>
                                        <span className="font-medium text-slate-900">{new Date(eventRequest.date_to).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time From:</span>
                                    <span className="font-medium text-slate-900">
                                        {eventRequest.time_from
                                            ? formatTimeToAMPM(eventRequest.time_from)
                                            : eventRequest.event_time
                                                ? formatTimeToAMPM(eventRequest.event_time)
                                                : "Not specified"}
                                    </span>
                                </div>
                                {eventRequest.time_to && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Time To:</span>
                                        <span className="font-medium text-slate-900">{formatTimeToAMPM(eventRequest.time_to)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Venue:</span>
                                    <span className="font-medium text-slate-900">{eventRequest.venue || eventRequest.venue_name || "Not specified"}</span>
                                </div>
                                {eventRequest.collaborating_org && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Collaborating Org:</span>
                                        <span className="font-medium text-slate-900">{eventRequest.collaborating_org}</span>
                                    </div>
                                )}
                                {eventRequest.coordinator_name && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Coordinator:</span>
                                        <span className="font-medium text-slate-900">{eventRequest.coordinator_name}</span>
                                    </div>
                                )}
                                {eventRequest.coordinator_contact && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Coordinator Contact:</span>
                                        <span className="font-medium text-slate-900">{eventRequest.coordinator_contact}</span>
                                    </div>
                                )}
                                {eventRequest.media_coverage && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Media Coverage:</span>
                                        <span className="font-medium text-slate-900">{eventRequest.media_coverage}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className="font-medium text-slate-900">{eventRequest.status_name}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Advisor Information Box */}
                        <Card className="p-4 border-l-4 border-l-blue-500 shadow-sm">
                            <h3 className="font-semibold mb-3 text-slate-800 flex items-center gap-2 border-b pb-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Advisor Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                {eventRequest.society_name && (
                                    <div className="pb-3 border-b border-dashed">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground font-medium">Society Name:</span>
                                            <span className="font-semibold text-slate-900">{eventRequest.society_name}</span>
                                        </div>
                                    </div>
                                )}
                                {eventRequest.advisor_name ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Advisor Name:</span>
                                            <span className="font-medium text-slate-900">{eventRequest.advisor_name}</span>
                                        </div>
                                        {eventRequest.advisor_email && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Advisor Email:</span>
                                                <span className="font-medium text-slate-900">{eventRequest.advisor_email}</span>
                                            </div>
                                        )}
                                        {eventRequest.advisor_phone && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Advisor Phone:</span>
                                                <span className="font-medium text-slate-900">{eventRequest.advisor_phone}</span>
                                            </div>
                                        )}
                                        {eventRequest.advisor_faculty_id && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Faculty ID:</span>
                                                <span className="font-medium text-slate-900">{eventRequest.advisor_faculty_id}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground italic">Advisor information not available</p>
                                )}
                            </div>
                        </Card>

                        {/* Sponsor Information Box */}
                        {(eventRequest.sponsor_name || eventRequest.sponsor_amount) && (
                            <Card className="p-4 border-l-4 border-l-green-500 shadow-sm">
                                <h3 className="font-semibold mb-3 text-slate-800 flex items-center gap-2 border-b pb-2">
                                    <FileText className="h-5 w-5 text-green-500" />
                                    Sponsor Information
                                </h3>
                                <div className="space-y-2 text-sm">
                                    {eventRequest.sponsor_name && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Sponsor Name:</span>
                                            <span className="font-medium text-slate-900">{eventRequest.sponsor_name}</span>
                                        </div>
                                    )}
                                    {eventRequest.sponsor_amount && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Sponsor Amount:</span>
                                            <span className="font-medium text-green-600">
                                                {typeof eventRequest.sponsor_amount === 'string'
                                                    ? (eventRequest.sponsor_amount.startsWith('PKR') || eventRequest.sponsor_amount.startsWith('$')
                                                        ? eventRequest.sponsor_amount.replace(/^\$/, 'PKR ')
                                                        : `PKR ${eventRequest.sponsor_amount}`)
                                                    : `PKR ${eventRequest.sponsor_amount}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Slot Information */}
                        {(eventRequest.slot_status_name || eventRequest.slot_date || eventRequest.slot_time_from) && (
                            <Card className="p-4 shadow-sm border-slate-200 border-l-4 border-l-blue-500">
                                <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    Slot Details
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {eventRequest.slot_status_name && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge variant={eventRequest.slot_status_id === 2 ? "default" : eventRequest.slot_status_id === 3 ? "destructive" : "secondary"}>
                                                {eventRequest.slot_status_name}
                                            </Badge>
                                        </div>
                                    )}
                                    {eventRequest.slot_date && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Date:
                                            </span>
                                            <span className="font-medium text-slate-900">
                                                {new Date(eventRequest.slot_date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {(eventRequest.slot_time_from || eventRequest.slot_time_to) && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                Time:
                                            </span>
                                            <span className="font-medium text-slate-900">
                                                {eventRequest.slot_time_from
                                                    ? formatTimeToAMPM(eventRequest.slot_time_from)
                                                    : "Not specified"}
                                                {eventRequest.slot_time_to && eventRequest.slot_time_from && (
                                                    <> - {formatTimeToAMPM(eventRequest.slot_time_to)}</>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {(eventRequest.venue_name || eventRequest.venue) && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                Venue:
                                            </span>
                                            <span className="font-medium text-slate-900">
                                                {eventRequest.venue_name || eventRequest.venue || "Not specified"}
                                            </span>
                                        </div>
                                    )}
                                    {eventRequest.slot_status_id === 2 && (
                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                <span className="text-green-600">✓</span>
                                                Slot has been granted by Protocol Office.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Description / Media Coverage */}
                    {(eventRequest.description || eventRequest.media_coverage) && (
                        <Card className="p-4 shadow-sm border-slate-200">
                            <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2">Event Description / Media Coverage</h3>
                            {eventRequest.description && (
                                <p className="text-muted-foreground leading-relaxed mb-3 text-sm">{eventRequest.description}</p>
                            )}
                            {eventRequest.media_coverage && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="font-medium text-sm mb-1 text-slate-800">Media Coverage:</p>
                                    <p className="text-muted-foreground leading-relaxed text-sm">{eventRequest.media_coverage}</p>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Participants: Students */}
                    {Array.isArray(eventRequest.student_participants) &&
                        eventRequest.student_participants.length > 0 && (
                            <Card className="p-4 shadow-sm border-slate-200">
                                <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2">Student Participants</h3>
                                <div className="space-y-2 text-sm">
                                    {eventRequest.student_participants.map((s: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex flex-wrap justify-between border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                                        >
                                            <span className="font-medium text-slate-900">
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
                    {Array.isArray(eventRequest.staff_participants) &&
                        eventRequest.staff_participants.length > 0 && (
                            <Card className="p-4 shadow-sm border-slate-200">
                                <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2">Staff Participants</h3>
                                <div className="space-y-2 text-sm">
                                    {eventRequest.staff_participants.map((s: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex flex-wrap justify-between border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                                        >
                                            <span className="font-medium text-slate-900">
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
                    {eventRequest.management_requirements && (
                        <Card className="p-4 shadow-sm border-slate-200">
                            <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2">Management Requirements</h3>
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div className="space-y-1">
                                    <p className="flex justify-between">
                                        <span className="font-medium text-slate-700">Sound System:</span>
                                        <span className={eventRequest.management_requirements.sound_system ? "text-green-600 font-semibold" : "text-slate-500"}>
                                            {eventRequest.management_requirements.sound_system ? "Yes" : "No"}
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="font-medium text-slate-700">Recording:</span>
                                        <span className={eventRequest.management_requirements.recording ? "text-green-600 font-semibold" : "text-slate-500"}>
                                            {eventRequest.management_requirements.recording ? "Yes" : "No"}
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="font-medium text-slate-700">Bouquet:</span>
                                        <span className={eventRequest.management_requirements.bouquet ? "text-green-600 font-semibold" : "text-slate-500"}>
                                            {eventRequest.management_requirements.bouquet ? "Yes" : "No"}
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="font-medium text-slate-700">Souvenirs:</span>
                                        <span className={eventRequest.management_requirements.souvenirs ? "text-green-600 font-semibold" : "text-slate-500"}>
                                            {eventRequest.management_requirements.souvenirs ? "Yes" : "No"}
                                        </span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="font-medium text-slate-700">University Photographer:</span>
                                        <span className={eventRequest.management_requirements.university_photographer ? "text-green-600 font-semibold" : "text-slate-500"}>
                                            {eventRequest.management_requirements.university_photographer ? "Yes" : "No"}
                                        </span>
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="flex justify-between">
                                        <span className="font-medium text-slate-700">Special Arrangements:</span>
                                        <span className={eventRequest.management_requirements.special_arrangements ? "text-green-600 font-semibold" : "text-slate-500"}>
                                            {eventRequest.management_requirements.special_arrangements ? "Yes" : "No"}
                                        </span>
                                    </p>
                                    {eventRequest.management_requirements.special_arrangements_detail && (
                                        <p className="text-xs text-muted-foreground bg-slate-50 p-2 rounded mt-1">
                                            {eventRequest.management_requirements.special_arrangements_detail}
                                        </p>
                                    )}
                                    <p className="flex justify-between mt-2">
                                        <span className="font-medium text-slate-700">Refreshments:</span>
                                        <span className={eventRequest.management_requirements.refreshment_required ? "text-green-600 font-semibold" : "text-slate-500"}>
                                            {eventRequest.management_requirements.refreshment_required ? "Yes" : "No"}
                                        </span>
                                    </p>
                                    {eventRequest.management_requirements.refreshment_required && (
                                        <p className="text-xs text-muted-foreground bg-slate-50 p-2 rounded mt-1">
                                            {eventRequest.management_requirements.refreshment_category || "Category not specified"}
                                            {" • "}
                                            {eventRequest.management_requirements.refreshment_persons
                                                ? `${eventRequest.management_requirements.refreshment_persons} persons`
                                                : "Count not specified"}
                                        </p>
                                    )}
                                    {eventRequest.management_requirements.any_other && (
                                        <p className="text-muted-foreground mt-2 text-sm">
                                            <span className="font-medium text-slate-700">Other:</span>{" "}
                                            {eventRequest.management_requirements.any_other}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Transport Requests */}
                    {Array.isArray(eventRequest.transport_requests) &&
                        eventRequest.transport_requests.length > 0 && (
                            <Card className="p-4 shadow-sm border-slate-200">
                                <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2">Transport Requests</h3>
                                <div className="space-y-2 text-sm">
                                    {eventRequest.transport_requests.map((t: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="border border-slate-200 rounded p-3 flex flex-wrap justify-between gap-2 bg-slate-50"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-900">{t.vehicle_type || "Vehicle not specified"}</p>
                                                <p className="text-muted-foreground text-xs mt-1">
                                                    {t.purpose || "Purpose not specified"}
                                                </p>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground space-y-1">
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
                    {Array.isArray(eventRequest.documents) &&
                        eventRequest.documents.length > 0 && (
                            <Card className="p-4 shadow-sm border-slate-200">
                                <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2">Attached Documents</h3>
                                <div className="space-y-2 text-sm">
                                    {eventRequest.documents.map((doc: any) => (
                                        <div
                                            key={doc.doc_id}
                                            className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                                        >
                                            <span className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-500" />
                                                <span>
                                                    <span className="font-medium capitalize text-slate-900">{doc.doc_type}</span>
                                                    <span className="text-muted-foreground">{" – "}{doc.file_path.split("/").pop()}</span>
                                                </span>
                                            </span>
                                            <a
                                                href={`${import.meta.env.VITE_API_URL}${doc.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded bg-blue-50"
                                            >
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                    {/* Admin Notes from History - Grouped by Role */}
                    {Array.isArray(eventRequest.status_history) &&
                        eventRequest.status_history.length > 0 && (
                            <Card className="p-4 shadow-sm border-slate-200">
                                <h3 className="font-semibold mb-4 text-slate-800 border-b pb-2">Admin Notes & Status History</h3>
                                <div className="space-y-6">
                                    {(() => {
                                        const notesByRole: { [key: string]: any[] } = {};
                                        eventRequest.status_history
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
                                                <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                    {role}
                                                </h4>
                                                {notesByRole[role].map((history: any, idx: number) => (
                                                    <div
                                                        key={history.history_id || idx}
                                                        className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 rounded-r"
                                                    >
                                                        <div className="flex items-start justify-between mb-1">
                                                            <div>
                                                                <p className="text-xs font-medium text-slate-700">
                                                                    {history.firstName && history.lastName
                                                                        ? `${history.firstName} ${history.lastName}`
                                                                        : role}
                                                                    {history.status_name && <span className="text-muted-foreground font-normal"> changed status to {history.status_name}</span>}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(history.changed_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{history.note}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </Card>
                        )}
                </div>

                <DialogFooterContent onClose={onClose} actionContent={actionContent} />
            </DialogContent>
        </Dialog>
    );
};

const DialogFooterContent = ({ onClose, actionContent }: { onClose: () => void, actionContent?: React.ReactNode }) => (
    <div className="bg-slate-50 px-6 py-4 border-t flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
            Close
        </Button>
        {actionContent}
    </div>
);

export default EventRequestDetailModal;
