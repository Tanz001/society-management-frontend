import React, { useState, useMemo, memo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Send,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { formatTimeToAMPM } from "@/lib/utils";

/* =====================================================================================
   TYPES
===================================================================================== */

type StudentRow = {
  id: string;
  academic_program: string;
  semester: string;
  no_of_students: string;
};

type StaffRow = {
  id: string;
  department: string;
  gazetted: "Gazetted" | "Non-Gazetted" | "";
  no_of_staff: string;
};

type TransportRow = {
  id: string;
  vehicle_type: string;
  purpose: string;
  no_of_persons: string;
  destination: string;
  date: string;
  time: string;
};

type GuestRow = {
  id: string;
  guest_name: string;
  description: string;
  profile_document: File | null;
  profile_document_path?: string | null; // Path to existing uploaded profile document
};

type ManagementRequirements = {
  sound_system: boolean;
  recording: boolean;
  special_arrangements: boolean;
  special_arrangements_detail: string;
  refreshment_required: boolean;
  refreshment_category: string;
  refreshment_persons: number | "";
  bouquet: boolean;
  souvenirs: boolean;
  university_photographer: boolean;
  any_other: string;
};

interface EventFullFormProps {
  societyId: number;
  userId?: number;
  onSubmitSuccess?: () => void;
  showCard?: boolean;
  reqId?: number; // For edit mode
}

/* =====================================================================================
   DEFAULT ROW TEMPLATES
===================================================================================== */

const defaultStudent: StudentRow = {
  id: "",
  academic_program: "",
  semester: "",
  no_of_students: "",
};

const defaultStaff: StaffRow = {
  id: "",
  department: "",
  gazetted: "",
  no_of_staff: "",
};

const defaultTransport: TransportRow = {
  id: "",
  vehicle_type: "",
  purpose: "",
  no_of_persons: "",
  destination: "",
  date: "",
  time: "",
};

const defaultGuest: GuestRow = {
  id: "",
  guest_name: "",
  description: "",
  profile_document: null,
};

const defaultManagement: ManagementRequirements = {
  sound_system: false,
  recording: false,
  special_arrangements: false,
  special_arrangements_detail: "",
  refreshment_required: false,
  refreshment_category: "",
  refreshment_persons: "",
  bouquet: false,
  souvenirs: false,
  university_photographer: false,
  any_other: "",
};

/* =====================================================================================
   SUB-COMPONENTS
===================================================================================== */

const Header = () => (
  <div className="flex items-center mb-4">
    <FileText className="mr-2 h-5 w-5 text-blue-600" />
    <h3 className="text-lg font-semibold">Complete Event Request Form</h3>
  </div>
);

// Student Row Component
const StudentRow = ({ student, index, onUpdate }: {
  student: StudentRow;
  index: number;
  onUpdate: (index: number, field: keyof StudentRow, value: any) => void;
}) => {
  const handleAcademicProgramChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "academic_program", e.target.value);
  }, [index, onUpdate]);

  const handleSemesterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "semester", e.target.value);
  }, [index, onUpdate]);

  const handleNoOfStudentsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "no_of_students", e.target.value);
  }, [index, onUpdate]);

  return (
    <div className="grid md:grid-cols-4 gap-3 items-end">
      <div>
        <Label>Academic Program</Label>
        <Input
          value={student.academic_program || ""}
          onChange={handleAcademicProgramChange}
          placeholder="e.g., BSCS"
        />
      </div>
      <div>
        <Label>Semester</Label>
        <Input
          value={student.semester || ""}
          onChange={handleSemesterChange}
          placeholder="e.g., 3rd"
        />
      </div>
      <div>
        <Label>No. of Students</Label>
        <Input
          type="number"
          value={student.no_of_students || ""}
          onChange={handleNoOfStudentsChange}
        />
      </div>
      <div />
    </div>
  );
};

/* STUDENT SECTION */
const StudentSection = ({
  students,
  setStudentCount,
  updateStudent,
  fieldErrors
}: {
  students: StudentRow[];
  setStudentCount: (count: number) => void;
  updateStudent: (index: number, field: keyof StudentRow, value: any) => void;
  fieldErrors?: {[key: string]: string};
}) => (
  <div className="space-y-2 border rounded p-4">
    <div className="flex justify-between items-center">
      <h4 className="font-medium">Student Participants</h4>
      <div className="flex items-center gap-2">
        <Label className="text-sm">No. of rows</Label>
        <Input
          type="number"
          min={0}
          value={students.length}
          onChange={(e) => setStudentCount(Number(e.target.value))}
          className="w-24"
        />
      </div>
    </div>

    {students.length === 0 && (
      <p className="text-sm text-gray-500">No students added.</p>
    )}

    {students.map((s, i) => {
      const incompleteError = fieldErrors?.[`student_${i}_incomplete`];
      const countError = fieldErrors?.[`student_${i}_count`];
      return (
        <div key={s.id}>
          <StudentRow
            student={s}
            index={i}
            onUpdate={updateStudent}
          />
          {(incompleteError || countError) && (
            <p className="text-sm text-red-600 mt-1 ml-2">{incompleteError || countError}</p>
          )}
        </div>
      );
    })}
  </div>
);

// Staff Row Component
const StaffRow = ({ staffMember, index, onUpdate }: {
  staffMember: StaffRow;
  index: number;
  onUpdate: (index: number, field: keyof StaffRow, value: any) => void;
}) => {
  const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "department", e.target.value);
  }, [index, onUpdate]);

  const handleGazettedChange = useCallback((v: string) => {
    onUpdate(index, "gazetted", v as any);
  }, [index, onUpdate]);

  const handleNoOfStaffChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "no_of_staff", e.target.value);
  }, [index, onUpdate]);

  return (
    <div className="grid md:grid-cols-4 gap-3 items-end">
      <div>
        <Label>Department</Label>
        <Input
          value={staffMember.department || ""}
          onChange={handleDepartmentChange}
          placeholder="e.g., Computer Science"
        />
      </div>
      <div>
        <Label>Gazetted</Label>
        <Select
          value={staffMember.gazetted || ""}
          onValueChange={handleGazettedChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Gazetted">Gazetted</SelectItem>
            <SelectItem value="Non-Gazetted">Non-Gazetted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>No. of Staff</Label>
        <Input
          type="number"
          value={staffMember.no_of_staff || ""}
          onChange={handleNoOfStaffChange}
        />
      </div>
      <div />
    </div>
  );
};

/* STAFF SECTION */
const StaffSection = ({
  staff,
  setStaffCount,
  updateStaff,
  fieldErrors
}: {
  staff: StaffRow[];
  setStaffCount: (count: number) => void;
  updateStaff: (index: number, field: keyof StaffRow, value: any) => void;
  fieldErrors?: {[key: string]: string};
}) => (
  <div className="space-y-2 border rounded p-4">
    <div className="flex justify-between items-center">
      <h4 className="font-medium">Staff Participants</h4>
      <div className="flex items-center gap-2">
        <Label className="text-sm">No. of rows</Label>
        <Input
          type="number"
          min={0}
          value={staff.length}
          onChange={(e) => setStaffCount(Number(e.target.value))}
          className="w-24"
        />
      </div>
    </div>

    {staff.length === 0 && (
      <p className="text-sm text-gray-500">No staff added.</p>
    )}

    {staff.map((st, i) => {
      const incompleteError = fieldErrors?.[`staff_${i}_incomplete`];
      const countError = fieldErrors?.[`staff_${i}_count`];
      return (
        <div key={st.id}>
          <StaffRow
            staffMember={st}
            index={i}
            onUpdate={updateStaff}
          />
          {(incompleteError || countError) && (
            <p className="text-sm text-red-600 mt-1 ml-2">{incompleteError || countError}</p>
          )}
        </div>
      );
    })}
  </div>
);

/* MANAGEMENT SECTION */
const ManagementSection = ({
  management,
  toggleManagement,
  setManagementField,
  fieldErrors,
  setFieldErrors
}: {
  management: ManagementRequirements;
  toggleManagement: (key: keyof ManagementRequirements) => void;
  setManagementField: (key: keyof ManagementRequirements, value: any) => void;
  fieldErrors?: {[key: string]: string};
  setFieldErrors?: (updater: (prev: {[key: string]: string}) => {[key: string]: string}) => void;
}) => (
  <div className="space-y-3 border rounded p-4">
    <h4 className="font-medium">Event Management Requirements</h4>

    <div className="grid md:grid-cols-3 gap-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={management.sound_system}
          onChange={() => toggleManagement("sound_system")}
          className="w-4 h-4"
        />
        Sound System
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={management.recording}
          onChange={() => toggleManagement("recording")}
          className="w-4 h-4"
        />
        Recording
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={management.bouquet}
          onChange={() => toggleManagement("bouquet")}
          className="w-4 h-4"
        />
        Bouquet
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={management.souvenirs}
          onChange={() => toggleManagement("souvenirs")}
          className="w-4 h-4"
        />
        Souvenirs
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={management.university_photographer}
          onChange={() => toggleManagement("university_photographer")}
          className="w-4 h-4"
        />
        University Photographer
      </label>
    </div>

    <div className="grid md:grid-cols-2 gap-3 mt-3">
      <div>
        <label className="flex items-center gap-2 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={management.special_arrangements}
            onChange={() => toggleManagement("special_arrangements")}
            className="w-4 h-4"
          />
          Special Arrangements
        </label>

        {management.special_arrangements && (
          <div>
            <Input
              placeholder="Arrangement details"
              value={management.special_arrangements_detail}
              onChange={(e) => {
                setManagementField("special_arrangements_detail", e.target.value);
              }}
              className={fieldErrors?.special_arrangements_detail ? "border-red-500" : ""}
            />
            {fieldErrors?.special_arrangements_detail && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.special_arrangements_detail}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={management.refreshment_required}
            onChange={() => toggleManagement("refreshment_required")}
            className="w-4 h-4"
          />
          Refreshments
        </label>

        {management.refreshment_required && (
          <div className="space-y-2">
            <div>
              <Input
                placeholder="Category (Tea/Lunch/Dinner)"
                value={management.refreshment_category}
              onChange={(e) => {
                setManagementField("refreshment_category", e.target.value);
              }}
                className={fieldErrors?.refreshment_category ? "border-red-500" : ""}
              />
              {fieldErrors?.refreshment_category && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.refreshment_category}</p>
              )}
            </div>
            <div>
              <Input
                type="number"
                placeholder="Number of persons"
                value={management.refreshment_persons as any}
              onChange={(e) => {
                setManagementField(
                  "refreshment_persons",
                  e.target.value ? Number(e.target.value) : ""
                );
              }}
                className={fieldErrors?.refreshment_persons ? "border-red-500" : ""}
              />
              {fieldErrors?.refreshment_persons && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.refreshment_persons}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    <div className="mt-3">
      <Label>Any Other Requirements</Label>
      <Textarea
        rows={2}
        value={management.any_other}
        onChange={(e) => setManagementField("any_other", e.target.value)}
        placeholder="Additional requirements..."
      />
    </div>
  </div>
);

// Transport Row Component
const TransportRow = ({ transport, index, onUpdate }: {
  transport: TransportRow;
  index: number;
  onUpdate: (index: number, field: keyof TransportRow, value: any) => void;
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleVehicleTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "vehicle_type", e.target.value);
  }, [index, onUpdate]);

  const handlePurposeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "purpose", e.target.value);
  }, [index, onUpdate]);

  const handleNoOfPersonsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "no_of_persons", e.target.value);
  }, [index, onUpdate]);

  const handleDestinationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "destination", e.target.value);
  }, [index, onUpdate]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "date", e.target.value);
  }, [index, onUpdate]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "time", e.target.value);
  }, [index, onUpdate]);

  return (
    <div className="border rounded p-3 space-y-3">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <Label>Vehicle Type</Label>
          <Input
            value={transport.vehicle_type || ""}
            onChange={handleVehicleTypeChange}
            onKeyDown={handleKeyDown}
            placeholder="Car, Van, Bus"
          />
        </div>
        <div>
          <Label>Purpose</Label>
          <Input
            value={transport.purpose || ""}
            onChange={handlePurposeChange}
            onKeyDown={handleKeyDown}
            placeholder="Guest pickup, Field visit..."
          />
        </div>
        <div>
          <Label>No. of Persons</Label>
          <Input
            type="number"
            value={transport.no_of_persons || ""}
            onChange={handleNoOfPersonsChange}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <Label>Destination</Label>
          <Input
            value={transport.destination || ""}
            onChange={handleDestinationChange}
            onKeyDown={handleKeyDown}
            placeholder="Location"
          />
        </div>
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={transport.date || ""}
            onChange={handleDateChange}
          />
        </div>
        <div>
          <Label>Time</Label>
          <Input
            type="time"
            value={transport.time || ""}
            onChange={handleTimeChange}
          />
        </div>
      </div>

      <div />
    </div>
  );
};

/* TRANSPORT SECTION */
const TransportSection = ({
  transports,
  setTransportCount,
  updateTransport,
  fieldErrors
}: {
  transports: TransportRow[];
  setTransportCount: (count: number) => void;
  updateTransport: (index: number, field: keyof TransportRow, value: any) => void;
  fieldErrors?: {[key: string]: string};
}) => (
  <div className="space-y-2 border rounded p-4">
    <div className="flex justify-between items-center">
      <h4 className="font-medium">Transport Requests</h4>
      <div className="flex items-center gap-2">
        <Label className="text-sm">No. of rows</Label>
        <Input
          type="number"
          min={0}
          value={transports.length}
          onChange={(e) => setTransportCount(Number(e.target.value))}
          className="w-24"
        />
      </div>
    </div>

    {transports.length === 0 && (
      <p className="text-sm text-gray-500">No transport added.</p>
    )}

    {transports.map((t, i) => {
      const vehicleError = fieldErrors?.[`transport_${i}_vehicle_type`];
      const purposeError = fieldErrors?.[`transport_${i}_purpose`];
      const destinationError = fieldErrors?.[`transport_${i}_destination`];
      const dateError = fieldErrors?.[`transport_${i}_date`];
      const timeError = fieldErrors?.[`transport_${i}_time`];
      const personsError = fieldErrors?.[`transport_${i}_no_of_persons`];
      const hasError = vehicleError || purposeError || destinationError || dateError || timeError || personsError;
      return (
        <div key={t.id}>
          <TransportRow
            transport={t}
            index={i}
            onUpdate={updateTransport}
          />
          {hasError && (
            <p className="text-sm text-red-600 mt-1 ml-2">
              {vehicleError || purposeError || destinationError || dateError || timeError || personsError}
            </p>
          )}
        </div>
      );
    })}
  </div>
);

// Guest Row Component
const GuestRowComponent = ({ guest, index, onUpdate }: {
  guest: GuestRow;
  index: number;
  onUpdate: (index: number, field: keyof GuestRow, value: any) => void;
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleGuestNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, "guest_name", e.target.value);
  }, [index, onUpdate]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(index, "description", e.target.value);
  }, [index, onUpdate]);

  const handleProfileDocumentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpdate(index, "profile_document", e.target.files[0]);
    }
  }, [index, onUpdate]);

  const handleRemoveProfile = useCallback(() => {
    onUpdate(index, "profile_document", null);
  }, [index, onUpdate]);

  return (
    <div className="border rounded p-3 space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <Label>Guest/Speaker Name *</Label>
          <Input
            value={guest.guest_name || ""}
            onChange={handleGuestNameChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter guest or speaker name"
          />
        </div>
        <div>
          <Label>Profile Document</Label>
          <Input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleProfileDocumentChange}
          />
          {guest.profile_document && (
            <div className="flex items-center justify-between text-sm mt-1 p-1 bg-gray-50 rounded">
              <span className="truncate">{guest.profile_document.name}</span>
              <Button variant="ghost" size="sm" type="button" onClick={handleRemoveProfile}>
                Remove
              </Button>
            </div>
          )}
          {/* Show existing profile document if it exists (when editing) */}
          {!guest.profile_document && guest.profile_document_path && (
            <div className="flex items-center justify-between text-sm mt-1 p-1 bg-blue-50 rounded border border-blue-200">
              <span className="truncate text-blue-800">
                Existing: {guest.profile_document_path.split('/').pop()}
              </span>
              <a
                href={`${import.meta.env.VITE_API_URL}${guest.profile_document_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium text-xs"
              >
                View
              </a>
            </div>
          )}
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          rows={2}
          value={guest.description || ""}
          onChange={handleDescriptionChange}
          placeholder="Brief description about the guest/speaker..."
        />
      </div>
      <div />
    </div>
  );
};

/* GUESTS & SPEAKERS SECTION */
const GuestSection = ({
  guests,
  setGuestCount,
  updateGuest,
  guestListFile,
  handleGuestListFile,
  removeGuestListFile,
  existingGuestLists = [],
  fieldErrors
}: {
  guests: GuestRow[];
  setGuestCount: (count: number) => void;
  updateGuest: (index: number, field: keyof GuestRow, value: any) => void;
  guestListFile: File | null;
  handleGuestListFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeGuestListFile: () => void;
  existingGuestLists?: Array<{ guest_list_id: number; file_path: string; created_at?: string }>;
  fieldErrors?: {[key: string]: string};
}) => (
  <div className="space-y-4">
    <div className="space-y-2 border rounded p-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Guests & Speakers</h4>
        <div className="flex items-center gap-2">
          <Label className="text-sm">No. of rows</Label>
          <Input
            type="number"
            min={0}
            value={guests.length}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </div>

      {guests.length === 0 && (
        <p className="text-sm text-gray-500">No guests/speakers added.</p>
      )}

      {guests.map((g, i) => {
        const descriptionError = fieldErrors?.[`guest_${i}_description`];
        return (
          <div key={g.id}>
            <GuestRowComponent
              guest={g}
              index={i}
              onUpdate={updateGuest}
            />
            {descriptionError && (
              <p className="text-sm text-red-600 mt-1 ml-2">{descriptionError}</p>
            )}
          </div>
        );
      })}
    </div>

    {/* Guest List File Upload */}
    <div className="border rounded p-4">
      <div className="space-y-2">
        <Label className="font-semibold">Guest List File (Optional)</Label>
        <p className="text-sm text-gray-600">
          Upload a file containing the complete guest list. You can upload additional guest lists.
        </p>
        
        {/* Show existing guest lists when editing */}
        {existingGuestLists.length > 0 && (
          <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">Previously Uploaded Guest Lists:</p>
            <div className="space-y-2">
              {existingGuestLists.map((guestList, index) => (
                <div key={guestList.guest_list_id || index} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                  <div className="flex-1">
                    <span className="truncate block">
                      {guestList.file_path.split('/').pop()}
                    </span>
                    {guestList.created_at && (
                      <span className="text-xs text-gray-500">
                        Uploaded: {new Date(guestList.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <a
                    href={`${import.meta.env.VITE_API_URL}${guestList.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium ml-2 text-xs"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
          onChange={handleGuestListFile}
        />
        {guestListFile && (
          <div className="flex items-center justify-between text-sm mt-1 p-2 bg-gray-50 rounded">
            <span className="truncate">{guestListFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={removeGuestListFile}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
);

/* FILE UPLOAD SECTION */
const DocumentSection = ({
  documents,
  handleFileGroup,
  removeDocument
}: {
  documents: {
    brochure: File[];
    script: File[];
    schedule: File[];
    invitation: File[];
  };
  handleFileGroup: (
    type: keyof typeof documents,
    files: FileList | null
  ) => void;
  removeDocument: (type: keyof typeof documents, index: number) => void;
}) => {
  const totalFiles =
    documents.brochure.length +
    documents.script.length +
    documents.schedule.length +
    documents.invitation.length;

  return (
    <div className="space-y-4 border rounded p-4">
      <h4 className="font-medium text-lg">Upload Event Documents</h4>

      {/* Event Program Documents */}
      <div className="space-y-2">
        <Label className="font-semibold">Event Program Documents</Label>
        <p className="text-sm text-gray-600">
          Upload Brochure, Script, Schedule, Invitation Card
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Brochure</Label>
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => handleFileGroup("brochure", e.target.files)}
            />
            {documents.brochure.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm mt-1 p-1 bg-gray-50 rounded"
              >
                <span className="truncate">{f.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument("brochure", i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Label>Script</Label>
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => handleFileGroup("script", e.target.files)}
            />
            {documents.script.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm mt-1 p-1 bg-gray-50 rounded"
              >
                <span className="truncate">{f.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument("script", i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Label>Schedule</Label>
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => handleFileGroup("schedule", e.target.files)}
            />
            {documents.schedule.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm mt-1 p-1 bg-gray-50 rounded"
              >
                <span className="truncate">{f.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument("schedule", i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Label>Invitation Card</Label>
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => handleFileGroup("invitation", e.target.files)}
            />
            {documents.invitation.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm mt-1 p-1 bg-gray-50 rounded"
              >
                <span className="truncate">{f.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument("invitation", i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {totalFiles > 0 && (
        <div className="border rounded p-3 bg-blue-50">
          <p className="text-sm font-medium">
            Total files selected: {totalFiles}
          </p>
        </div>
      )}
    </div>
  );
};

/* =====================================================================================
   MAIN COMPONENT
===================================================================================== */

const EventFullForm: React.FC<EventFullFormProps> = ({
  societyId,
  userId,
  onSubmitSuccess,
  showCard = true,
  reqId,
}) => {
  const isEditMode = !!reqId;
  /* ------------------ MAIN FIELDS ------------------ */
  const [main, setMain] = useState({
    event_name: "",
    event_type: "",
    date_from: "",
    date_to: "",
    time_from: "",
    time_to: "",
    venue_id: "",
    custom_venue_name: "",
    collaborating_org: "",
    sponsor_name: "",
    sponsor_amount: "",
    coordinator_name: "",
    coordinator_contact: "",
    media_coverage: "",
  });

  /* ------------------ VENUES & SLOTS ------------------ */
  const [venues, setVenues] = useState<Array<{ venue_id: number; venue_name: string; capacity?: number; location?: string }>>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<Array<{ slot_id: number; time_from: string; time_to: string; status_name: string }>>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [previouslySelectedSlotId, setPreviouslySelectedSlotId] = useState<number | null>(null);

  const genId = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  /* ------------------ SECTIONS ------------------ */
  const [students, setStudents] = useState<StudentRow[]>([
    { ...defaultStudent, id: genId() },
  ]);
  const [staff, setStaff] = useState<StaffRow[]>([{ ...defaultStaff, id: genId() }]);
  const [transports, setTransports] = useState<TransportRow[]>([]);
  const [guests, setGuests] = useState<GuestRow[]>([{ ...defaultGuest, id: genId() }]);
  const [guestListFile, setGuestListFile] = useState<File | null>(null);
  const [existingGuestLists, setExistingGuestLists] = useState<Array<{ guest_list_id: number; file_path: string; created_at?: string }>>([]);
  const [management, setManagement] = useState<ManagementRequirements>({
    ...defaultManagement,
  });

  // Toggle sections
  const [includeStudents, setIncludeStudents] = useState(true);
  const [includeStaff, setIncludeStaff] = useState(false);

  /* ------------------ DOCUMENTS ------------------ */
  const [documents, setDocuments] = useState<{
    brochure: File[];
    script: File[];
    schedule: File[];
    invitation: File[];
  }>({
    brochure: [],
    script: [],
    schedule: [],
    invitation: [],
  });

  const [loading, setLoading] = useState(false);

  /* =====================================================================================
     FETCH VENUES AND OCCUPIED SLOTS
  ===================================================================================== */

  // Fetch venues on component mount
  useEffect(() => {
    const fetchVenues = async () => {
      setLoadingVenues(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadingVenues(false);
          return;
        }

        const response = await axios.get(`${API_URL}/society/venues`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setVenues(response.data.data || []);
        }
      } catch (error: any) {
        console.error("Error fetching venues:", error);
        toast.error("Failed to load venues");
      } finally {
        setLoadingVenues(false);
      }
    };

    fetchVenues();
  }, []);

  // Load existing event request data in edit mode
  useEffect(() => {
    if (!reqId) return;

    const loadEventRequestData = async () => {
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/admin/event-requests/${reqId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const data = response.data.data;
          
          // Populate main fields
          setMain({
            event_name: data.event_name || "",
            event_type: data.event_type || "",
            date_from: data.date_from ? new Date(data.date_from).toISOString().split('T')[0] : "",
            date_to: data.date_to ? new Date(data.date_to).toISOString().split('T')[0] : "",
            time_from: data.time_from || "",
            time_to: data.time_to || "",
            venue_id: data.venue_id ? String(data.venue_id) : (data.custom_venue_name ? "4" : ""),
            custom_venue_name: data.custom_venue_name || "",
            collaborating_org: data.collaborating_org || "",
            sponsor_name: data.sponsor_name || "",
            sponsor_amount: data.sponsor_amount || "",
            coordinator_name: data.coordinator_name || "",
            coordinator_contact: data.coordinator_contact || "",
            media_coverage: data.media_coverage || "",
          });

          // Store previously selected slot_id if it exists
          if (data.slot_id) {
            setPreviouslySelectedSlotId(data.slot_id);
          }

          // Populate student participants
          if (data.student_participants && Array.isArray(data.student_participants) && data.student_participants.length > 0) {
            setStudents(data.student_participants.map((s: any) => ({
              id: genId(),
              academic_program: s.academic_program || "",
              semester: s.semester || "",
              no_of_students: String(s.no_of_students || ""),
            })));
            setIncludeStudents(true);
          }

          // Populate staff participants
          if (data.staff_participants && Array.isArray(data.staff_participants) && data.staff_participants.length > 0) {
            setStaff(data.staff_participants.map((s: any) => ({
              id: genId(),
              department: s.department || "",
              gazetted: s.gazetted || "",
              no_of_staff: String(s.no_of_staff || ""),
            })));
            setIncludeStaff(true);
          }

          // Populate transport requests
          if (data.transport_requests && Array.isArray(data.transport_requests) && data.transport_requests.length > 0) {
            setTransports(data.transport_requests.map((t: any) => ({
              id: genId(),
              vehicle_type: t.vehicle_type || "",
              purpose: t.purpose || "",
              no_of_persons: String(t.no_of_persons || ""),
              destination: t.destination || "",
              date: t.date ? new Date(t.date).toISOString().split('T')[0] : "",
              time: t.time || "",
            })));
          }

          // Populate management requirements
          if (data.management_requirements) {
            setManagement({
              sound_system: data.management_requirements.sound_system || false,
              recording: data.management_requirements.recording || false,
              special_arrangements: data.management_requirements.special_arrangements || false,
              special_arrangements_detail: data.management_requirements.special_arrangements_detail || "",
              refreshment_required: data.management_requirements.refreshment_required || false,
              refreshment_category: data.management_requirements.refreshment_category || "",
              refreshment_persons: data.management_requirements.refreshment_persons || "",
              bouquet: data.management_requirements.bouquet || false,
              souvenirs: data.management_requirements.souvenirs || false,
              university_photographer: data.management_requirements.university_photographer || false,
              any_other: data.management_requirements.any_other || "",
            });
          }

          // Populate event guests
          if (data.event_guests && Array.isArray(data.event_guests) && data.event_guests.length > 0) {
            setGuests(data.event_guests.map((g: any) => ({
              id: genId(),
              guest_name: g.guest_name || "",
              description: g.description || "",
              profile_document: null, // Files can't be loaded, user can re-upload if needed
              profile_document_path: g.profile_document_path || null, // Store path to show existing document info
            })));
          }

          // Populate existing guest lists (for display only)
          if (data.guest_lists && Array.isArray(data.guest_lists) && data.guest_lists.length > 0) {
            setExistingGuestLists(data.guest_lists);
          } else if (data.guest_list) {
            // Fallback to single guest_list for backward compatibility
            setExistingGuestLists([{
              guest_list_id: 0,
              file_path: data.guest_list.file_path,
              created_at: data.guest_list.created_at
            }]);
          }

          // Note: Documents and guest list files are not loaded as they are files - user can re-upload if needed
          // Existing guest lists will be shown in the UI but not loaded as File objects
        }
      } catch (error: any) {
        console.error("Error loading event request data:", error);
        toast.error(error.response?.data?.message || "Failed to load event request data");
      } finally {
        setLoading(false);
      }
    };

    loadEventRequestData();
  }, [reqId]);

  // Fetch occupied slots when venue and date are selected (skip for "Other" venue)
  useEffect(() => {
    const fetchOccupiedSlots = async () => {
      if (!main.venue_id || !main.date_from || main.venue_id === "4") {
        setOccupiedSlots([]);
        setTimeSlotError("");
        return;
      }

      setLoadingSlots(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadingSlots(false);
          return;
        }

        const response = await axios.get(
          `${API_URL}/society/venues/${main.venue_id}/slots?date=${main.date_from}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          const slots = response.data.data || [];
          setOccupiedSlots(slots);
          
          // Re-check if current time slot is still occupied after fetching new slots
          if (main.time_from && main.time_to && slots.length > 0) {
            // Check overlap directly with new slots
            const normalizeTime = (time: string) => time ? time.substring(0, 5) : null;
            const timeToMinutes = (timeStr: string) => {
              const [hours, minutes] = timeStr.split(':').map(Number);
              return hours * 60 + minutes;
            };
            
            const normalizedFrom = normalizeTime(main.time_from);
            const normalizedTo = normalizeTime(main.time_to);
            
            if (normalizedFrom && normalizedTo) {
              const reqStart = timeToMinutes(normalizedFrom);
              const reqEnd = timeToMinutes(normalizedTo);
              
              const hasOverlap = slots.some((slot: any) => {
                // Skip the previously selected slot - allow re-selecting it
                if (previouslySelectedSlotId && slot.slot_id === previouslySelectedSlotId) {
                  return false;
                }
                
                const slotFrom = normalizeTime(slot.time_from);
                const slotTo = normalizeTime(slot.time_to);
                if (!slotFrom || !slotTo) return false;
                const slotStart = timeToMinutes(slotFrom);
                const slotEnd = timeToMinutes(slotTo);
                return (reqStart < slotEnd && reqEnd > slotStart);
              });
              
              if (hasOverlap) {
                setTimeSlotError("This time slot overlaps with an occupied slot. Please choose a different time.");
              } else {
                setTimeSlotError("");
              }
            }
          } else if (main.time_from && main.time_to && slots.length === 0) {
            setTimeSlotError("");
          }
        }
      } catch (error: any) {
        console.error("Error fetching occupied slots:", error);
        setOccupiedSlots([]);
        setTimeSlotError("");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchOccupiedSlots();
  }, [main.venue_id, main.date_from]);

  // Check if a time slot is occupied (with better overlap detection)
  // Excludes the previously selected slot to allow re-selecting granted slots
  const isTimeSlotOccupied = (timeFrom: string, timeTo: string) => {
    if (!timeFrom || !timeTo || occupiedSlots.length === 0) return false;
    
    // Normalize time format to HH:MM
    const normalizeTime = (time: string) => {
      if (!time) return null;
      // If time is in HH:MM:SS format, take only HH:MM
      return time.substring(0, 5);
    };
    
    const normalizedFrom = normalizeTime(timeFrom);
    const normalizedTo = normalizeTime(timeTo);
    
    if (!normalizedFrom || !normalizedTo) return false;
    
    // Convert to minutes for easier comparison
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const reqStart = timeToMinutes(normalizedFrom);
    const reqEnd = timeToMinutes(normalizedTo);
    
    return occupiedSlots.some((slot) => {
      // Skip the previously selected slot - allow re-selecting it
      if (previouslySelectedSlotId && slot.slot_id === previouslySelectedSlotId) {
        return false;
      }
      
      const slotFrom = normalizeTime(slot.time_from);
      const slotTo = normalizeTime(slot.time_to);
      
      if (!slotFrom || !slotTo) return false;
      
      const slotStart = timeToMinutes(slotFrom);
      const slotEnd = timeToMinutes(slotTo);
      
      // Check for any overlap: two time ranges overlap if one starts before the other ends
      // and one ends after the other starts
      return (reqStart < slotEnd && reqEnd > slotStart);
    });
  };

  // State to track if current time slot is occupied
  const [timeSlotError, setTimeSlotError] = useState<string>("");
  
  // Field errors state
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  
  const steps = [
    { number: 1, title: "Basic Information", completed: false },
    { number: 2, title: "Student Participants", completed: false },
    { number: 3, title: "Staff Participants", completed: false },
    { number: 4, title: "Management Requirements", completed: false },
    { number: 5, title: "Transport Requests", completed: false },
    { number: 6, title: "Guests & Speakers", completed: false },
    { number: 7, title: "Documents", completed: false },
  ];
  
  /* =====================================================================================
     DATE VALIDATION HELPERS
  ===================================================================================== */

  // Calculate minimum date (7 days from today)
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 7);
    return minDate.toISOString().split("T")[0];
  };

  // Check if date is at least 7 days from today
  const isDateAtLeast7DaysAway = (dateString: string) => {
    if (!dateString) return true; // Allow empty dates to be handled by required validation
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    selectedDate.setHours(0, 0, 0, 0);
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  };

  /* =====================================================================================
     STEP-SPECIFIC VALIDATION
  ===================================================================================== */

  const validateStep = (step: number): boolean => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    switch (step) {
      case 1: // Basic Information
        if (!main.event_name.trim()) {
          errors.event_name = "Please fill the input";
          isValid = false;
        }
        if (!main.event_type.trim()) {
          errors.event_type = "Please fill the input";
          isValid = false;
        }
        if (!main.date_from) {
          errors.date_from = "Please fill the input";
          isValid = false;
        } else if (!isEditMode && !isDateAtLeast7DaysAway(main.date_from)) {
          // Skip 7-day validation when editing existing event request
          errors.date_from = "You have to send request at least 7 days before the event";
          isValid = false;
        }
        if (!main.time_from) {
          errors.time_from = "Please fill the input";
          isValid = false;
        }
        if (!main.time_to) {
          errors.time_to = "Please fill the input";
          isValid = false;
        }
        if (!main.venue_id) {
          errors.venue_id = "Please fill the input";
          isValid = false;
        }
        // Check time slot conflict
        if (main.time_from && main.time_to && isTimeSlotOccupied(main.time_from, main.time_to)) {
          errors.time_slot = "This time slot overlaps with an occupied slot. Please choose a different time.";
          setTimeSlotError("This time slot overlaps with an occupied slot. Please choose a different time.");
          isValid = false;
        }
        // Check end date logic
        if (main.date_to && new Date(main.date_to).getTime() < new Date(main.date_from).getTime()) {
          errors.date_to = "End date cannot be before start date";
          isValid = false;
        }
        setFieldErrors(errors);
        if (!isValid) {
          toast.error("Please fill all required fields");
        }
        return isValid;

      case 2: // Student Participants
        if (includeStudents && students.length > 0) {
          for (let i = 0; i < students.length; i++) {
            const s = students[i];
            if (s.academic_program.trim() && (!s.semester.trim() || !s.no_of_students.trim())) {
              errors[`student_${i}_incomplete`] = `Student row ${i + 1}: Please fill all fields or leave the row empty`;
              isValid = false;
            }
            if (s.no_of_students !== "" && (+s.no_of_students <= 0 || isNaN(+s.no_of_students))) {
              errors[`student_${i}_count`] = `Student row ${i + 1}: Please enter a valid number of students`;
              isValid = false;
            }
          }
        }
        setFieldErrors(errors);
        if (!isValid) {
          toast.error("Please fill all required fields");
        }
        return isValid;

      case 3: // Staff Participants
        if (includeStaff && staff.length > 0) {
          for (let i = 0; i < staff.length; i++) {
            const s = staff[i];
            if (s.department.trim() && (!s.gazetted || !s.no_of_staff.trim())) {
              errors[`staff_${i}_incomplete`] = `Staff row ${i + 1}: Please fill all fields or leave the row empty`;
              isValid = false;
            }
            if (s.no_of_staff !== "" && (+s.no_of_staff <= 0 || isNaN(+s.no_of_staff))) {
              errors[`staff_${i}_count`] = `Staff row ${i + 1}: Please enter a valid number of staff`;
              isValid = false;
            }
          }
        }
        setFieldErrors(errors);
        if (!isValid) {
          toast.error("Please fill all required fields");
        }
        return isValid;

      case 4: // Management Requirements
        if (management.refreshment_required) {
          if (!management.refreshment_category.trim()) {
            errors.refreshment_category = "Please fill the input";
            isValid = false;
          }
          if (management.refreshment_persons === "" || +management.refreshment_persons <= 0) {
            errors.refreshment_persons = "Please fill the input";
            isValid = false;
          }
        }
        if (management.special_arrangements && !management.special_arrangements_detail.trim()) {
          errors.special_arrangements_detail = "Please fill the input";
          isValid = false;
        }
        setFieldErrors(errors);
        if (!isValid) {
          toast.error("Please fill all required fields");
        }
        return isValid;

      case 5: // Transport Requests
        if (transports.length > 0) {
          for (let i = 0; i < transports.length; i++) {
            const t = transports[i];
            if (t.vehicle_type.trim() || t.purpose.trim() || t.destination.trim() || t.date || t.time || t.no_of_persons.trim()) {
              // If any field is filled, all required fields must be filled
              if (!t.vehicle_type.trim()) {
                errors[`transport_${i}_vehicle_type`] = "Please fill the input";
                isValid = false;
              }
              if (!t.purpose.trim()) {
                errors[`transport_${i}_purpose`] = "Please fill the input";
                isValid = false;
              }
              if (!t.destination.trim()) {
                errors[`transport_${i}_destination`] = "Please fill the input";
                isValid = false;
              }
              if (!t.date) {
                errors[`transport_${i}_date`] = "Please fill the input";
                isValid = false;
              }
              if (!t.time) {
                errors[`transport_${i}_time`] = "Please fill the input";
                isValid = false;
              }
              if (!t.no_of_persons.trim() || +t.no_of_persons <= 0 || isNaN(+t.no_of_persons)) {
                errors[`transport_${i}_no_of_persons`] = "Please fill the input";
                isValid = false;
              }
            }
          }
        }
        setFieldErrors(errors);
        if (!isValid) {
          toast.error("Please fill all required fields");
        }
        return isValid;

      case 6: // Guests & Speakers
        if (guests.length > 0) {
          for (let i = 0; i < guests.length; i++) {
            const g = guests[i];
            if (g.guest_name.trim() && !g.description.trim()) {
              errors[`guest_${i}_description`] = "Please fill the input";
              isValid = false;
            }
          }
        }
        setFieldErrors(errors);
        if (!isValid) {
          toast.error("Please fill all required fields");
        }
        return isValid;

      case 7: // Documents
        // Documents are optional, so no validation needed
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (!validateStep(currentStep)) {
      return; // Validation failed, don't proceed
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // If somehow on last step, don't allow going further
      console.warn("Already on last step");
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      // Allow going back to previous steps without validation
      if (step < currentStep) {
        setCurrentStep(step);
      } else if (step === currentStep) {
        // Already on this step, do nothing
      } else {
        // Trying to skip ahead - validate current step first
        if (validateStep(currentStep)) {
          setCurrentStep(step);
        } else {
          toast.error("Please complete the current step before proceeding");
        }
      }
    }
  };

  /* =====================================================================================
     HANDLERS: MAIN FIELDS
  ===================================================================================== */

  const handleMainChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    
    setMain((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Check for 7-day minimum requirement when date_from changes (only for new requests, not edits)
      if (name === 'date_from' && value && !isEditMode) {
        if (!isDateAtLeast7DaysAway(value)) {
          setFieldErrors((prev) => ({
            ...prev,
            date_from: "You have to send request at least 7 days before the event"
          }));
        } else {
          setFieldErrors((prev) => {
            const updated = { ...prev };
            delete updated.date_from;
            return updated;
          });
        }
      } else if (name === 'date_from' && value && isEditMode) {
        // Clear any existing 7-day validation error when in edit mode
        setFieldErrors((prev) => {
          const updated = { ...prev };
          delete updated.date_from;
          return updated;
        });
      }
      
      // Check for time slot conflict when time_from or time_to changes
      if ((name === 'time_from' || name === 'time_to') && updated.venue_id && updated.date_from) {
        if (updated.time_from && updated.time_to) {
          if (isTimeSlotOccupied(updated.time_from, updated.time_to)) {
            setTimeSlotError("This time slot overlaps with an occupied slot. Please choose a different time.");
          } else {
            setTimeSlotError("");
          }
        } else {
          setTimeSlotError("");
        }
      }
      
      return updated;
    });
  };

  const handleVenueChange = (venueId: string) => {
    setMain((prev) => ({ 
      ...prev, 
      venue_id: venueId,
      // Clear custom_venue_name when switching away from "Other"
      custom_venue_name: venueId === "4" ? prev.custom_venue_name : ""
    }));
  };

  /* =====================================================================================
     HANDLERS: STUDENTS
  ===================================================================================== */

  const updateStudent = useCallback((
    index: number,
    field: keyof StudentRow,
    value: any
  ) => {
    setStudents((prev) => {
      const newStudents = [...prev];
      newStudents[index] = { ...newStudents[index], [field]: value };
      return newStudents;
    });
    // Clear error for this field when user starts typing
    const errorKey = `student_${index}_${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
    }
  }, [fieldErrors]);

  /* =====================================================================================
     HANDLERS: STAFF
  ===================================================================================== */

  const updateStaff = useCallback((index: number, field: keyof StaffRow, value: any) => {
    setStaff((prev) => {
      const newStaff = [...prev];
      newStaff[index] = { ...newStaff[index], [field]: value };
      return newStaff;
    });
    // Clear error for this field when user starts typing
    const errorKey = `staff_${index}_${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
    }
  }, [fieldErrors]);

  /* =====================================================================================
     HANDLERS: TRANSPORT
  ===================================================================================== */

  const updateTransport = useCallback((
    index: number,
    field: keyof TransportRow,
    value: any
  ) => {
    setTransports((prev) => {
      const newTransports = [...prev];
      newTransports[index] = { ...newTransports[index], [field]: value };
      return newTransports;
    });
    // Clear error for this field when user starts typing
    const errorKey = `transport_${index}_${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
    }
  }, [fieldErrors]);

  /* =====================================================================================
     HANDLERS: GUESTS/SPEAKERS
  ===================================================================================== */

  const updateGuest = useCallback((
    index: number,
    field: keyof GuestRow,
    value: any
  ) => {
    setGuests((prev) => {
      const newGuests = [...prev];
      newGuests[index] = { ...newGuests[index], [field]: value };
      return newGuests;
    });
    // Clear error for this field when user starts typing
    const errorKey = `guest_${index}_${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
    }
  }, [fieldErrors]);
  const handleGuestListFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGuestListFile(e.target.files[0]);
    }
  };
  const removeGuestListFile = () => {
    setGuestListFile(null);
  };

  /* =====================================================================================
     COUNT-BASED ROW HELPERS (no add/remove buttons)
  ===================================================================================== */

  const clampCount = (n: number) => {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  };

  const adjustRows = <T,>(current: T[], desiredCount: number, makeRow: () => T) => {
    const count = clampCount(desiredCount);
    if (current.length === count) return current;
    if (current.length < count) {
      const toAdd = Array.from({ length: count - current.length }, () => makeRow());
      return [...current, ...toAdd];
    }
    return current.slice(0, count);
  };

  const setStudentCount = (count: number) => {
    setStudents((prev) => adjustRows(prev, count, () => ({ ...defaultStudent, id: genId() })));
  };
  const setStaffCount = (count: number) => {
    setStaff((prev) => adjustRows(prev, count, () => ({ ...defaultStaff, id: genId() })));
  };
  const setTransportCount = (count: number) => {
    setTransports((prev) => adjustRows(prev, count, () => ({ ...defaultTransport, id: genId() })));
  };
  const setGuestCount = (count: number) => {
    setGuests((prev) => adjustRows(prev, count, () => ({ ...defaultGuest, id: genId() })));
  };

  /* =====================================================================================
     HANDLERS: MANAGEMENT CHECKBOXES
  ===================================================================================== */

  const toggleManagement = (key: keyof ManagementRequirements) => {
    setManagement((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }));
  };

  const setManagementField = (key: keyof ManagementRequirements, value: any) => {
    setManagement((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field when user starts typing
    if (fieldErrors[key as string]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[key as string];
        return updated;
      });
    }
  };

  /* =====================================================================================
     DOCUMENT UPLOAD HANDLER (CATEGORIZED)
  ===================================================================================== */

  const handleFileGroup = (
    type: keyof typeof documents,
    files: FileList | null
  ) => {
    if (!files) return;
    const arr = Array.from(files);
    setDocuments((prev) => ({
      ...prev,
      [type]: [...prev[type], ...arr],
    }));
  };

  const removeDocument = (type: keyof typeof documents, index: number) => {
    setDocuments((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  /* =====================================================================================
     VALIDATION
  ===================================================================================== */

  const validate = () => {
    console.log("Validating form data:", {
      event_name: main.event_name,
      event_type: main.event_type,
      date_from: main.date_from,
      time_from: main.time_from,
      venue_id: main.venue_id,
      time_to: main.time_to,
    });
    
    if (!main.event_name.trim()) {
      console.error("Validation failed: Event name is required");
      toast.error("Event name is required");
      return false;
    }
    if (!main.event_type.trim()) {
      console.error("Validation failed: Event type is required");
      toast.error("Event type is required");
      return false;
    }
    if (!main.date_from) {
      console.error("Validation failed: Start date is required");
      toast.error("Start date is required");
      return false;
    }
    // Skip 7-day validation when editing existing event request
    if (!isEditMode && !isDateAtLeast7DaysAway(main.date_from)) {
      console.error("Validation failed: Event date must be at least 7 days from today");
      toast.error("You have to send request at least 7 days before the event");
      setFieldErrors((prev) => ({
        ...prev,
        date_from: "You have to send request at least 7 days before the event"
      }));
      return false;
    }
    if (!main.time_from) {
      console.error("Validation failed: Start time is required");
      toast.error("Start time is required");
      return false;
    }
    if (!main.venue_id) {
      console.error("Validation failed: Venue is required");
      toast.error("Venue is required");
      setFieldErrors((prev) => ({
        ...prev,
        venue_id: "Venue is required"
      }));
      return false;
    }

    // Validate custom venue name when "Other" (venue_id = 4) is selected
    if (main.venue_id === "4") {
      if (!main.custom_venue_name || !main.custom_venue_name.trim()) {
        console.error("Validation failed: Custom venue name is required when 'Other' is selected");
        toast.error("Custom venue name is required");
        setFieldErrors((prev) => ({
          ...prev,
          custom_venue_name: "Custom venue name is required"
        }));
        return false;
      }
    }

    // Check if selected time slot is occupied (skip for "Other" venue)
    if (main.time_from && main.time_to && main.venue_id !== "4") {
      if (isTimeSlotOccupied(main.time_from, main.time_to)) {
        console.error("Validation failed: Time slot overlaps with occupied slot");
        toast.error("The selected time slot overlaps with an occupied slot. Please choose a different time.");
        setTimeSlotError("This time slot overlaps with an occupied slot. Please choose a different time.");
        return false;
      }
    }
    
    // Also check if time_to is required when time_from is set
    if (main.time_from && !main.time_to) {
      console.error("Validation failed: End time is required when start time is set");
      toast.error("End time is required when start time is set.");
      return false;
    }

    // End date logic
    if (
      main.date_to &&
      new Date(main.date_to).getTime() < new Date(main.date_from).getTime()
    ) {
      console.error("Validation failed: End date cannot be before start date");
      toast.error("End date cannot be before start date");
      return false;
    }

    // Student rows validation (only if enabled)
    if (includeStudents) {
      for (let i = 0; i < students.length; i++) {
        const s = students[i];
        if (
          s.no_of_students !== "" &&
          (+s.no_of_students <= 0 || isNaN(+s.no_of_students))
        ) {
          console.error(`Validation failed: Student row ${i + 1} must have a valid student count`);
          toast.error(`Student row ${i + 1} must have a valid student count`);
          return false;
        }
      }
    }

    // Staff rows validation (only if enabled)
    if (includeStaff) {
      for (let i = 0; i < staff.length; i++) {
        const s = staff[i];
        if (
          s.no_of_staff !== "" &&
          (+s.no_of_staff <= 0 || isNaN(+s.no_of_staff))
        ) {
          console.error(`Validation failed: Staff row ${i + 1} must have a valid staff count`);
          toast.error(`Staff row ${i + 1} must have a valid staff count`);
          return false;
        }
      }
    }

    // Transport validation
    for (let i = 0; i < transports.length; i++) {
      const t = transports[i];
      if (t.no_of_persons !== "" && (+t.no_of_persons <= 0 || isNaN(+t.no_of_persons))) {
        console.error(`Validation failed: Transport row ${i + 1} must have valid number of persons`);
        toast.error(`Transport row ${i + 1} must have valid number of persons`);
        return false;
      }
    }

    // Refreshment validation
    if (management.refreshment_required) {
      if (
        management.refreshment_persons === "" ||
        +management.refreshment_persons <= 0
      ) {
        console.error("Validation failed: Enter valid number of persons for refreshment");
        toast.error("Enter valid number of persons for refreshment");
        return false;
      }
    }

    console.log("All validations passed!");
    return true;
  };

  /* =====================================================================================
     SUBMIT FORM
  ===================================================================================== */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("handleSubmit called", { currentStep, totalSteps, isEditMode });
    
    // Prevent submission if not on the last step
    if (currentStep !== totalSteps) {
      console.warn(`Form submission blocked: Current step is ${currentStep}, but must be ${totalSteps}`);
      toast.error(`Please complete all steps before submitting. You are on step ${currentStep} of ${totalSteps}`);
      return;
    }
    
    // Validate form
    console.log("Running validation...");
    if (!validate()) {
      console.warn("Validation failed");
      return;
    }
    
    console.log("Validation passed, starting API call...");
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      const fd = new FormData();

      // Get userId from props or localStorage
      const finalUserId = userId || (() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          return userData.id || userData.faculty_id;
        }
        return null;
      })();

      if (!finalUserId) {
        toast.error("User ID is required. Please log in again.");
        setLoading(false);
        return;
      }

      // MAIN FIELDS
      fd.append("society_id", String(societyId));
      fd.append("submitted_by", String(finalUserId));

      Object.entries(main).forEach(([k, v]) => {
        fd.append(k, v ?? "");
      });

      // PARTICIPANTS - Match backend field names (convert string numbers to numbers)
      const studentParticipants = includeStudents ? students.map(s => ({
        ...s,
        no_of_students: s.no_of_students ? Number(s.no_of_students) : ""
      })) : [];
      
      const staffParticipants = includeStaff ? staff.map(st => ({
        ...st,
        no_of_staff: st.no_of_staff ? Number(st.no_of_staff) : ""
      })) : [];
      
      const transportRequests = transports.map(t => ({
        ...t,
        no_of_persons: t.no_of_persons ? Number(t.no_of_persons) : ""
      }));
      
      fd.append("student_participants", JSON.stringify(studentParticipants));
      fd.append("staff_participants", JSON.stringify(staffParticipants));
      fd.append("transport_requests", JSON.stringify(transportRequests));

      // GUESTS/SPEAKERS - Prepare guest data (excluding files, files will be appended separately)
      const guestsData = guests
        .filter(g => g.guest_name.trim() !== "") // Only include guests with names
        .map(g => ({
          guest_name: g.guest_name,
          description: g.description || null,
        }));
      fd.append("event_guests", JSON.stringify(guestsData));

      // GUEST PROFILE DOCUMENTS - Append guest profile documents
      guests.forEach((guest, index) => {
        if (guest.profile_document) {
          fd.append(`guest_profile_${index}`, guest.profile_document);
        }
      });

      // GUEST LIST FILE
      if (guestListFile) {
        fd.append("guest_list", guestListFile);
      }
      
      // MANAGEMENT REQUIREMENTS
      fd.append("management_requirements", JSON.stringify(management));

      // DOCUMENTS - Append with specific field names
      documents.brochure.forEach((file) => fd.append("brochure", file));
      documents.script.forEach((file) => fd.append("script", file));
      documents.schedule.forEach((file) => fd.append("schedule", file));
      documents.invitation.forEach((file) => fd.append("invitation", file));

      const endpoint = isEditMode && reqId 
        ? `${API_URL}/society/event-request/update`
        : `${API_URL}/society/event-request/create`;
      const method = isEditMode && reqId ? 'PUT' : 'POST';
      
      console.log(`Making ${method} request to: ${endpoint}`);
      console.log("FormData entries:", Array.from(fd.entries()).map(([key, value]) => [key, value instanceof File ? value.name : value]));

      let res;
      if (isEditMode && reqId) {
        // Update existing event request
        fd.append("req_id", String(reqId));
        res = await axios.put(
          endpoint,
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Create new event request
        res = await axios.post(
          endpoint,
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
      
      console.log("API response received:", res.data);

      if (res.data.success) {
        toast.success(isEditMode ? "Event Request Updated Successfully!" : "Event Request Submitted Successfully!");

        // RESET FORM only if not in edit mode
        if (!isEditMode) {
          setMain({
            event_name: "",
            event_type: "",
            date_from: "",
            date_to: "",
            time_from: "",
            time_to: "",
            venue_id: "",
            custom_venue_name: "",
            collaborating_org: "",
            sponsor_name: "",
            sponsor_amount: "",
            coordinator_name: "",
            coordinator_contact: "",
            media_coverage: "",
          });
          setOccupiedSlots([]);
          setTimeSlotError("");

          setStudents([{ ...defaultStudent, id: genId() }]);
          setStaff([{ ...defaultStaff, id: genId() }]);
          setTransports([]);
          setGuests([{ ...defaultGuest, id: genId() }]);
          setGuestListFile(null);
          setManagement({ ...defaultManagement });
          setDocuments({
            brochure: [],
            script: [],
            schedule: [],
            invitation: [],
          });
          setIncludeStudents(true);
          setIncludeStaff(false);
        }

        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        toast.error(res.data.message || (isEditMode ? "Failed to update" : "Failed to submit"));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Error submitting event request"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================================================
     UI SECTIONS
  ===================================================================================== */







  /* =====================================================================================
     STEP NAVIGATION
  ===================================================================================== */
  
  const StepIndicator = () => {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    
    return (
      <div className="mb-6 sticky top-0 bg-white z-10 py-4 -mx-6 px-6 border-b border-gray-200 shadow-sm">
        {/* Current Step Title and Progress - Always Visible */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-university-navy">
              Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.title}
            </h3>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-university-navy via-university-gold to-green-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Compact Step Numbers - All Steps Visible, No Scrolling */}
        <div className="flex items-center justify-between gap-0.5 sm:gap-1">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (step.number < currentStep) {
                      goToStep(step.number);
                    } else if (step.number === currentStep) {
                      // Already on this step
                    } else {
                      toast.error("Please complete the current step before proceeding");
                    }
                  }}
                  className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full border-2 transition-all ${
                    currentStep === step.number
                      ? "bg-university-navy text-white border-university-navy shadow-lg scale-110 ring-2 ring-university-gold ring-offset-2"
                      : currentStep > step.number
                      ? "bg-green-500 text-white border-green-500 cursor-pointer hover:bg-green-600 hover:scale-105"
                      : "bg-white text-gray-400 border-gray-300"
                  }`}
                  title={`Step ${step.number}: ${step.title}`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  ) : (
                    <span className="text-[10px] sm:text-xs md:text-sm font-semibold">{step.number}</span>
                  )}
                </button>
                {/* Show abbreviated title on larger screens - only for current and completed steps */}
                <span
                  className={`mt-1.5 text-[9px] sm:text-[10px] font-medium text-center leading-tight hidden sm:block ${
                    currentStep === step.number
                      ? "text-university-navy font-semibold"
                      : currentStep > step.number
                      ? "text-green-600"
                      : "text-gray-400"
                  } ${
                    // Show title only for current and completed steps to keep it compact
                    step.number <= currentStep ? "block" : "hidden"
                  }`}
                >
                  {step.title.length > 8 
                    ? step.title.substring(0, 8) + "..." 
                    : step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-0.5 sm:mx-1 ${
                    currentStep > step.number ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  /* =====================================================================================
     STEP CONTENT
  ===================================================================================== */

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-university-navy mb-4">
              Basic Event Information
            </h3>
            {/* Basic event info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Event Name *</Label>
                <Input
                  name="event_name"
                  value={main.event_name}
                  onChange={handleMainChange}
                  placeholder="e.g., Tech Innovation Summit"
                  className={fieldErrors.event_name ? "border-red-500" : ""}
                />
                {fieldErrors.event_name && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.event_name}</p>
                )}
              </div>
              <div>
                <Label>Event Type *</Label>
                <Input
                  name="event_type"
                  value={main.event_type}
                  onChange={handleMainChange}
                  placeholder="Seminar, Workshop, Lecture..."
                  className={fieldErrors.event_type ? "border-red-500" : ""}
                />
                {fieldErrors.event_type && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.event_type}</p>
                )}
              </div>
            </div>

            {/* Dates & Times */}
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Start Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    name="date_from"
                    type="date"
                    value={main.date_from}
                    onChange={handleMainChange}
                    min={getMinDate()}
                    className={`pl-10 ${fieldErrors.date_from ? 'border-red-500' : ''}`}
                  />
                </div>
                {fieldErrors.date_from && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.date_from}</p>
                )}
              </div>

              <div>
                <Label>End Date</Label>
                <Input
                  name="date_to"
                  type="date"
                  value={main.date_to}
                  onChange={handleMainChange}
                  min={main.date_from || ""}
                  className={fieldErrors.date_to ? 'border-red-500' : ''}
                />
                {fieldErrors.date_to && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.date_to}</p>
                )}
              </div>

              <div>
                <Label>Start Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    name="time_from"
                    type="time"
                    value={main.time_from}
                    onChange={handleMainChange}
                    className={`pl-10 ${fieldErrors.time_from || timeSlotError ? 'border-red-500' : ''}`}
                  />
                </div>
                {fieldErrors.time_from && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.time_from}</p>
                )}
                {timeSlotError && main.time_from && main.time_to && !fieldErrors.time_from && (
                  <p className="text-sm text-red-600 mt-1">{timeSlotError}</p>
                )}
              </div>

              <div>
                <Label>End Time *</Label>
                <Input
                  name="time_to"
                  type="time"
                  value={main.time_to}
                  onChange={handleMainChange}
                  min={main.time_from || undefined}
                  className={fieldErrors.time_to || timeSlotError ? 'border-red-500' : ''}
                />
                {fieldErrors.time_to && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.time_to}</p>
                )}
                {timeSlotError && main.time_from && main.time_to && !fieldErrors.time_to && (
                  <p className="text-sm text-red-600 mt-1">{timeSlotError}</p>
                )}
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-3">
              <div>
                <Label>Venue *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Select
                    value={main.venue_id}
                    onValueChange={(value) => {
                      handleVenueChange(value);
                      // Clear error when venue is selected
                      if (fieldErrors.venue_id) {
                        setFieldErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.venue_id;
                          return updated;
                        });
                      }
                    }}
                    disabled={loadingVenues}
                  >
                    <SelectTrigger className={`pl-10 ${fieldErrors.venue_id ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder={loadingVenues ? "Loading venues..." : "Select a venue"} />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.venue_id} value={String(venue.venue_id)}>
                          {venue.venue_name}
                          {venue.capacity && ` (Capacity: ${venue.capacity})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {fieldErrors.venue_id && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.venue_id}</p>
                )}
              </div>

              {/* Custom Venue Name Input - Show when "Other" (venue_id = 4) is selected */}
              {main.venue_id === "4" && (
                <div>
                  <Label>Custom Venue Name *</Label>
                  <Input
                    value={main.custom_venue_name}
                    onChange={(e) => {
                      setMain((prev) => ({ ...prev, custom_venue_name: e.target.value }));
                      // Clear error when user starts typing
                      if (fieldErrors.custom_venue_name) {
                        setFieldErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.custom_venue_name;
                          return updated;
                        });
                      }
                    }}
                    placeholder="Enter custom venue name"
                    className={fieldErrors.custom_venue_name ? 'border-red-500' : ''}
                  />
                  {fieldErrors.custom_venue_name && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.custom_venue_name}</p>
                  )}
                </div>
              )}

              {/* Display occupied slots - Hide when "Other" venue is selected */}
              {main.venue_id && main.venue_id !== "4" && main.date_from && (
                <div className="border rounded p-3 bg-gray-50">
                  <Label className="text-sm font-semibold mb-2 block">
                    Occupied slots for {main.date_from}
                  </Label>
                  {loadingSlots ? (
                    <p className="text-sm text-gray-500">Loading slots...</p>
                  ) : occupiedSlots.length > 0 ? (
                    <div className="space-y-1">
                      {occupiedSlots.map((slot) => {
                        const isPreviouslySelected = previouslySelectedSlotId === slot.slot_id;
                        return (
                        <div
                          key={slot.slot_id}
                            className={`text-sm p-2 rounded ${
                              isPreviouslySelected
                                ? "bg-blue-50 border-2 border-blue-500"
                                : "bg-red-50 border border-red-200"
                            }`}
                        >
                          <span className="font-medium">
                            {formatTimeToAMPM(slot.time_from)} - {slot.time_to ? formatTimeToAMPM(slot.time_to) : "N/A"}
                          </span>
                            <span className={`ml-2 ${isPreviouslySelected ? "text-blue-600" : "text-red-600"}`}>
                              ({slot.status_name})
                            </span>
                            {isPreviouslySelected && (
                              <span className="ml-2 text-xs font-semibold text-blue-700">
                                ← Previously Selected
                              </span>
                            )}
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">No occupied slots for this date</p>
                  )}
                  {previouslySelectedSlotId && main.time_from && main.time_to && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-300 rounded">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Your previously selected slot:</span>{" "}
                        {formatTimeToAMPM(main.time_from)} - {formatTimeToAMPM(main.time_to)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Collaborators */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Collaborating Organization</Label>
                <Input
                  name="collaborating_org"
                  value={main.collaborating_org}
                  onChange={handleMainChange}
                />
              </div>
              <div>
                <Label>Sponsor Name</Label>
                <Input
                  name="sponsor_name"
                  value={main.sponsor_name}
                  onChange={handleMainChange}
                />
              </div>
              <div>
                <Label>Sponsor Amount (PKR)</Label>
                <Input
                  name="sponsor_amount"
                  type="number"
                  value={main.sponsor_amount}
                  onChange={handleMainChange}
                />
              </div>
            </div>

            {/* Coordinator */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Coordinator Name</Label>
                <Input
                  name="coordinator_name"
                  value={main.coordinator_name}
                  onChange={handleMainChange}
                />
              </div>
              <div>
                <Label>Coordinator Contact</Label>
                <Input
                  name="coordinator_contact"
                  value={main.coordinator_contact}
                  onChange={handleMainChange}
                />
              </div>
            </div>

            {/* Media */}
            <div>
              <Label>Media Coverage (optional)</Label>
              <Textarea
                rows={3}
                name="media_coverage"
                value={main.media_coverage}
                onChange={handleMainChange}
                placeholder="Describe media coverage plans..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-university-navy">
                Student Participants
              </h3>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStudents}
                    onChange={(e) => setIncludeStudents(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Include Students</span>
                </label>
              </div>
            </div>
            {includeStudents && (
              <StudentSection
                students={students}
                setStudentCount={setStudentCount}
                updateStudent={updateStudent}
                fieldErrors={fieldErrors}
              />
            )}
            {!includeStudents && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  Student participants are disabled. Enable the toggle above to add students.
                </p>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-university-navy">
                Staff Participants
              </h3>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStaff}
                    onChange={(e) => setIncludeStaff(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Include Staff</span>
                </label>
              </div>
            </div>
            {includeStaff && (
              <StaffSection
                staff={staff}
                setStaffCount={setStaffCount}
                updateStaff={updateStaff}
                fieldErrors={fieldErrors}
              />
            )}
            {!includeStaff && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  Staff participants are disabled. Enable the toggle above to add staff.
                </p>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-university-navy mb-4">
              Management Requirements
            </h3>
            <ManagementSection
              management={management}
              toggleManagement={toggleManagement}
              setManagementField={setManagementField}
              fieldErrors={fieldErrors}
              setFieldErrors={setFieldErrors}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-university-navy mb-4">
              Transport Requests
            </h3>
            <TransportSection
              transports={transports}
              setTransportCount={setTransportCount}
              updateTransport={updateTransport}
              fieldErrors={fieldErrors}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-university-navy mb-4">
              Guests & Speakers
            </h3>
            <GuestSection
              guests={guests}
              setGuestCount={setGuestCount}
              updateGuest={updateGuest}
              guestListFile={guestListFile}
              handleGuestListFile={handleGuestListFile}
              removeGuestListFile={removeGuestListFile}
              existingGuestLists={existingGuestLists}
              fieldErrors={fieldErrors}
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-university-navy mb-4">
              Upload Documents
            </h3>
            <DocumentSection
              documents={documents}
              handleFileGroup={handleFileGroup}
              removeDocument={removeDocument}
            />
          </div>
        );

      default:
        return null;
    }
  };

  /* =====================================================================================
     FINAL FORM UI
  ===================================================================================== */

  const form = (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Only allow submission on the last step
        if (currentStep === totalSteps) {
          console.log("Form submission triggered, calling handleSubmit");
          handleSubmit(e);
        } else {
          console.warn(`Form submission prevented: Current step is ${currentStep}, required step is ${totalSteps}`);
          toast.error(`Please complete all steps before submitting. You are on step ${currentStep} of ${totalSteps}`);
        }
      }}
      onKeyDown={(e) => {
        // Prevent form submission on Enter key unless on last step
        if (e.key === 'Enter') {
          if (currentStep !== totalSteps) {
            e.preventDefault();
            e.stopPropagation();
            // Don't auto-advance, let user click Next button
            return false;
          }
        }
      }}
      className="space-y-6"
    >
      <StepIndicator />
      
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>

        {currentStep < totalSteps ? (
          <Button
            type="button"
            variant="university"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextStep();
            }}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            variant="university"
            disabled={loading || currentStep !== totalSteps}
            onClick={(e) => {
              // Don't prevent default - let form onSubmit handle it
              // Just log for debugging
              if (currentStep !== totalSteps) {
                console.warn(`Submit button clicked but not on last step. Current: ${currentStep}, Total: ${totalSteps}`);
                toast.error(`Please complete all steps. You are on step ${currentStep} of ${totalSteps}`);
                e.preventDefault();
                e.stopPropagation();
                return false;
              } else {
                console.log("Submit button clicked on last step, form will submit");
              }
            }}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditMode ? "Updating..." : "Submitting..."}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {isEditMode ? "Update Request" : "Submit Request"}
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );

  /* =====================================================================================
     FINAL RENDER (WITH / WITHOUT CARD)
  ===================================================================================== */

  if (showCard) {
    return (
      <Card className="p-6 shadow-md">
        <Header />
        {form}
      </Card>
    );
  }

  return (
    <div className="p-4">
      <Header />
      {form}
    </div>
  );
};

export default EventFullForm;