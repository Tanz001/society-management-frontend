import React, { useState } from "react";
// Metadata: Forced update to trigger hot-reload - version 1.1
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
    variant?: "default" | "detailed";
    isLoading?: boolean;
}

const EventRequestDetailModal: React.FC<EventRequestDetailModalProps> = ({
    isOpen,
    onClose,
    eventRequest,
    actionContent,
    variant = "default",
    isLoading = false
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

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-navy mb-4"></div>
                        <p className="text-muted-foreground">Loading event details...</p>
                    </div>
                ) : !eventRequest ? (
                    <div className="flex-1 flex items-center justify-center p-12 italic text-muted-foreground">
                        No request details available
                    </div>
                ) : (
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
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${variant === 'detailed' ? 'lg:grid-cols-3' : ''} gap-6`}>
                            <Card className="p-4 shadow-sm border-slate-200 border-t-4 border-t-university-navy">
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

                            {/* Submitted By Box - Prominent in first row */}
                            <Card className="p-4 border-t-4 border-t-indigo-500 shadow-sm border-slate-200">
                                <h3 className="font-semibold mb-3 text-slate-800 flex items-center gap-2 border-b pb-2">
                                    <Users className="h-5 w-5 text-indigo-500" />
                                    Submitted By
                                </h3>
                                <div className="space-y-4 text-sm mt-1">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Name</span>
                                        <span className="font-bold text-slate-900 text-base">
                                            {eventRequest.student_info?.firstName
                                                ? `${eventRequest.student_info.firstName} ${eventRequest.student_info.lastName || ""}`
                                                : eventRequest.firstName
                                                    ? `${eventRequest.firstName} ${eventRequest.lastName || ""}`
                                                    : "Not available"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Email</span>
                                        <span className="font-medium text-slate-900">
                                            {eventRequest.student_info?.email || eventRequest.email || "Not provided"}
                                        </span>
                                    </div>
                                    {eventRequest.society_name && (
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Society</span>
                                            <Badge variant="outline" className="w-fit mt-1 border-indigo-200 text-indigo-700 font-bold">
                                                {eventRequest.society_name}
                                            </Badge>
                                        </div>
                                    )}
                                    {(eventRequest.student_info?.rollNo || eventRequest.rollNo) && (
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Roll No</span>
                                            <span className="font-semibold text-slate-900">
                                                {eventRequest.student_info?.rollNo || eventRequest.rollNo}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Submitted On</span>
                                        <span className="font-medium text-slate-700">
                                            {new Date(eventRequest.created_at).toLocaleString('en-US', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Advisor Information Box - Prominent in first row */}
                            <Card className="p-4 border-t-4 border-t-blue-500 shadow-sm border-slate-200">
                                <h3 className="font-semibold mb-3 text-slate-800 flex items-center gap-2 border-b pb-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Advisor Information
                                </h3>
                                <div className="space-y-4 text-sm mt-1">
                                    {(eventRequest.advisor_name || eventRequest.advisor_info?.name) ? (
                                        <>
                                            <div className="flex flex-col">
                                                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Advisor Name</span>
                                                <span className="font-bold text-slate-900 text-base">
                                                    {eventRequest.advisor_info?.name || eventRequest.advisor_name}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Email</span>
                                                <span className="font-medium text-slate-900">
                                                    {eventRequest.advisor_info?.email || eventRequest.advisor_email || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Phone</span>
                                                <span className="font-medium text-slate-900">
                                                    {eventRequest.advisor_info?.phone || eventRequest.advisor_phone || "N/A"}
                                                </span>
                                            </div>
                                            {(eventRequest.advisor_info?.faculty_id || eventRequest.advisor_faculty_id) && (
                                                <div className="flex flex-col">
                                                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Faculty ID</span>
                                                    <span className="font-semibold text-slate-900 border-l-2 border-blue-200 pl-2 mt-1 bg-blue-50/30">
                                                        {eventRequest.advisor_info?.faculty_id || eventRequest.advisor_faculty_id}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <Users className="h-10 w-10 text-slate-300 mb-2" />
                                            <p className="text-muted-foreground italic text-xs">Advisor information not available</p>
                                        </div>
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

                            {/* Slot Information - Prominent in second row */}
                            {(eventRequest.slot_status_name || eventRequest.slot_date || eventRequest.slot_time_from || eventRequest.slot_time_to) ? (
                                <Card className="p-4 shadow-sm border-slate-200 border-t-4 border-t-amber-500">
                                    <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-amber-500" />
                                        Slot Request Status
                                    </h3>
                                    <div className="space-y-4 text-sm mt-1">
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">Status</span>
                                            <Badge
                                                variant={eventRequest.slot_status_id === 2 ? "default" : eventRequest.slot_status_id === 3 ? "destructive" : "secondary"}
                                                className={eventRequest.slot_status_id === 2 ? "bg-green-600 hover:bg-green-700" : ""}
                                            >
                                                {eventRequest.slot_status_name || "Pending Selection"}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> Requested Date
                                            </span>
                                            <span className="font-bold text-slate-900 mt-1">
                                                {eventRequest.slot_date
                                                    ? new Date(eventRequest.slot_date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : "Not selected"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Time Range
                                            </span>
                                            <span className="font-bold text-slate-900 mt-1">
                                                {eventRequest.slot_time_from
                                                    ? formatTimeToAMPM(eventRequest.slot_time_from)
                                                    : "N/A"}
                                                {eventRequest.slot_time_to && eventRequest.slot_time_from && (
                                                    <> - {formatTimeToAMPM(eventRequest.slot_time_to)}</>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> Official Venue
                                            </span>
                                            <span className="font-bold text-slate-900 mt-1">
                                                {eventRequest.venue_name || eventRequest.venue || "Not specified"}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="p-4 shadow-sm border-slate-200 bg-slate-50/50 italic text-center flex flex-col items-center justify-center min-h-[200px]">
                                    <Calendar className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                                    <p className="text-xs text-muted-foreground">No slot request associated with this event.</p>
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

                        {/* Guest Profiles (with profile documents) */}
                        {Array.isArray(eventRequest.event_guests) && eventRequest.event_guests.length > 0 && (
                            <Card className="p-4 shadow-sm border-slate-200">
                                <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2">Guest Profiles</h3>
                                <div className="space-y-3 text-sm">
                                    {eventRequest.event_guests.map((guest: any) => (
                                        <div
                                            key={guest.guest_id}
                                            className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-3 last:pb-0"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-slate-900">{guest.guest_name || "Guest"}</span>
                                                {guest.description && (
                                                    <span className="text-muted-foreground text-xs">{guest.description}</span>
                                                )}
                                            </div>
                                            {guest.profile_document_path && (
                                                <a
                                                    href={`${import.meta.env.VITE_API_URL}${guest.profile_document_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded bg-blue-50"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    View Profile Document
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Guest List Documents */}
                        {(Array.isArray(eventRequest.guest_lists) && eventRequest.guest_lists.length > 0) && (
                            <Card className="p-4 shadow-sm border-slate-200">
                                <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2">Guest List Documents</h3>
                                <div className="space-y-2 text-sm">
                                    {eventRequest.guest_lists.map((gl: any, idx: number) => (
                                        <div
                                            key={gl.guest_list_id || idx}
                                            className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                                        >
                                            <span className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-500" />
                                                <span>
                                                    <span className="font-medium text-slate-900">Guest List</span>
                                                    <span className="text-muted-foreground">{" – "}{gl.file_path?.split("/").pop() || "Document"}</span>
                                                    {gl.created_at && (
                                                        <span className="text-muted-foreground text-xs block">Uploaded: {new Date(gl.created_at).toLocaleDateString()}</span>
                                                    )}
                                                </span>
                                            </span>
                                            <a
                                                href={`${import.meta.env.VITE_API_URL}${gl.file_path}`}
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
                                            // Sort items chronologically first
                                            const sortedHistory: any[] = [...(eventRequest.status_history || [])]
                                                .sort((a: any, b: any) =>
                                                    new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
                                                );

                                            // Process history to group Advisor notes under the latest Admin
                                            let currentAdminRole = "Advisor";
                                            const processedHistory = sortedHistory.map((h: any) => {
                                                const role = h.role || h.role_display_name || h.role_name || "";
                                                const roleLower = role.toLowerCase();

                                                let effectiveRole = role || "Admin";
                                                let isAdvisorNote = roleLower === "advisor";

                                                let displayNote = h.note ?? h.remarks;
                                                if (displayNote && typeof displayNote === 'string') {
                                                    try {
                                                        const parsed = JSON.parse(displayNote);
                                                        displayNote = parsed.note ?? null;
                                                    } catch (e) {
                                                        // Not JSON, keep as is
                                                    }
                                                }

                                                let displayRoleName = (h.firstName && h.lastName) ? `${h.firstName} ${h.lastName}` : role;

                                                // Extract advisor notes that were recorded as system-like messages
                                                // Example: "Event request updated. Status set to Pending after revision by Board Secretary. Note: what missing"
                                                if (h.note && h.note.startsWith("Event request updated. Status set to Pending after revision by")) {
                                                    isAdvisorNote = true;
                                                    displayRoleName = "Advisor";

                                                    // Try to extract just the note part
                                                    const noteMatch = h.note.match(/Note:\s*(.*)/i);
                                                    if (noteMatch && noteMatch[1]) {
                                                        displayNote = noteMatch[1].trim();
                                                    }
                                                }

                                                if (!isAdvisorNote && roleLower !== "system") {
                                                    currentAdminRole = effectiveRole;
                                                }

                                                return {
                                                    ...h,
                                                    note: displayNote, // Use the extracted note
                                                    _displayRoleName: displayRoleName, // Use the proper name (Student/Advisor or Admin)
                                                    _effectiveRole: isAdvisorNote ? currentAdminRole : effectiveRole,
                                                    _roleLower: roleLower,
                                                    _isAdvisorNote: isAdvisorNote
                                                };
                                            }).filter((h: any) => {
                                                if (h._roleLower === "system" && !h._isAdvisorNote) return false;
                                                // Exclude initial submission status
                                                if (h.note === "Event request submitted" || h.note === "Event request created") return false;
                                                // Exclude advisor notes with no content or generic update messages
                                                if (h._isAdvisorNote) {
                                                    const n = String(h.note || "").trim();
                                                    if (!n) return false;
                                                    if (/^Event request updated and resubmitted\.?$/i.test(n)) return false;
                                                    if (/^Event request updated\.\s*Status remains .+\.?$/i.test(n)) return false;
                                                }
                                                return true;
                                            });

                                            const notesByRole: { [key: string]: any[] } = {};
                                            processedHistory.forEach((history: any) => {
                                                const role = history._effectiveRole;
                                                if (!notesByRole[role]) {
                                                    notesByRole[role] = [];
                                                }
                                                notesByRole[role].push(history);
                                            });

                                            const roleOrder = ["Advisor", "Board Secretary", "Board President", "Registrar", "VC", "Transport Office", "Protocol Office", "Chief Proctor", "Security Office"];
                                            const sortedRoles = Object.keys(notesByRole).sort((a, b) => {
                                                const aIndex = roleOrder.indexOf(a);
                                                const bIndex = roleOrder.indexOf(b);
                                                if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
                                                if (aIndex === -1) return 1;
                                                if (bIndex === -1) return -1;
                                                return aIndex - bIndex;
                                            });

                                            if (sortedRoles.length === 0) {
                                                return <p className="text-sm text-muted-foreground italic">No status history available.</p>;
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
                                                            className={`border-l-4 ${history.note ? 'border-blue-500' : 'border-slate-300'} pl-4 py-2 ${history.note ? 'bg-blue-50/50' : 'bg-slate-50/30'} rounded-r`}
                                                        >
                                                            <div className="flex items-start justify-between mb-1">
                                                                <div>
                                                                    <p className="text-xs font-medium text-slate-700">
                                                                        {history._displayRoleName}
                                                                        {history.status_name && !history._isAdvisorNote && (
                                                                            <span className="text-muted-foreground font-normal">
                                                                                {" "}changed status to <span className="font-medium text-slate-800">{history.status_name}</span>
                                                                            </span>
                                                                        )}
                                                                        {history._isAdvisorNote && (
                                                                            <span className="text-muted-foreground font-normal">
                                                                                {" "}added a note
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(history.changed_at).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {/* Only show note if it exists and is not empty */}
                                                            {history.note && history.note.trim() !== "" && (
                                                                <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{history.note}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </Card>
                            )}
                    </div>
                )}

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
