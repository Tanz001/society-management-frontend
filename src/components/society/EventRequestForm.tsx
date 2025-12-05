import React, { useState } from "react";
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
  Plus,
  X,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

/* =====================================================================================
   TYPES
===================================================================================== */

type StudentRow = {
  academic_program: string;
  semester: string;
  no_of_students: number | "";
};

type StaffRow = {
  department: string;
  gazetted: "Gazetted" | "Non-Gazetted";
  no_of_staff: number | "";
};

type TransportRow = {
  vehicle_type: string;
  purpose: string;
  no_of_persons: number | "";
  destination: string;
  date: string;
  time: string;
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
  userId: number;
  onSubmitSuccess?: () => void;
  showCard?: boolean;
}

/* =====================================================================================
   DEFAULT ROW TEMPLATES
===================================================================================== */

const defaultStudent: StudentRow = {
  academic_program: "",
  semester: "",
  no_of_students: "",
};

const defaultStaff: StaffRow = {
  department: "",
  gazetted: "Non-Gazetted",
  no_of_staff: "",
};

const defaultTransport: TransportRow = {
  vehicle_type: "",
  purpose: "",
  no_of_persons: "",
  destination: "",
  date: "",
  time: "",
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
   MAIN COMPONENT
===================================================================================== */

const EventFullForm: React.FC<EventFullFormProps> = ({
  societyId,
  userId,
  onSubmitSuccess,
  showCard = true,
}) => {
  /* ------------------ MAIN FIELDS ------------------ */
  const [main, setMain] = useState({
    event_name: "",
    event_type: "",
    date_from: "",
    date_to: "",
    time_from: "",
    time_to: "",
    venue: "",
    collaborating_org: "",
    sponsor_name: "",
    sponsor_amount: "",
    coordinator_name: "",
    coordinator_contact: "",
    media_coverage: "",
  });

  /* ------------------ SECTIONS ------------------ */
  const [students, setStudents] = useState<StudentRow[]>([
    { ...defaultStudent },
  ]);
  const [staff, setStaff] = useState<StaffRow[]>([{ ...defaultStaff }]);
  const [transports, setTransports] = useState<TransportRow[]>([]);
  const [management, setManagement] = useState<ManagementRequirements>({
    ...defaultManagement,
  });

  // Toggle sections
  const [includeStudents, setIncludeStudents] = useState(true);
  const [includeStaff, setIncludeStaff] = useState(false);
  const [hasGuestSpeaker, setHasGuestSpeaker] = useState(false);

  /* ------------------ DOCUMENTS ------------------ */
  const [documents, setDocuments] = useState<{
    brochure: File[];
    script: File[];
    schedule: File[];
    invitation: File[];
    guest_profile: File[];
    other: File[];
  }>({
    brochure: [],
    script: [],
    schedule: [],
    invitation: [],
    guest_profile: [],
    other: [],
  });

  const [loading, setLoading] = useState(false);

  /* =====================================================================================
     HANDLERS: MAIN FIELDS
  ===================================================================================== */

  const handleMainChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMain((prev) => ({ ...prev, [name]: value }));
  };

  /* =====================================================================================
     HANDLERS: STUDENTS
  ===================================================================================== */

  const addStudent = () =>
    setStudents((prev) => [...prev, { ...defaultStudent }]);
  const removeStudent = (index: number) =>
    setStudents((prev) => prev.filter((_, i) => i !== index));
  const updateStudent = (
    index: number,
    field: keyof StudentRow,
    value: any
  ) =>
    setStudents((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );

  /* =====================================================================================
     HANDLERS: STAFF
  ===================================================================================== */

  const addStaff = () => setStaff((prev) => [...prev, { ...defaultStaff }]);
  const removeStaff = (index: number) =>
    setStaff((prev) => prev.filter((_, i) => i !== index));
  const updateStaff = (index: number, field: keyof StaffRow, value: any) =>
    setStaff((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );

  /* =====================================================================================
     HANDLERS: TRANSPORT
  ===================================================================================== */

  const addTransport = () =>
    setTransports((prev) => [...prev, { ...defaultTransport }]);
  const removeTransport = (index: number) =>
    setTransports((prev) => prev.filter((_, i) => i !== index));
  const updateTransport = (
    index: number,
    field: keyof TransportRow,
    value: any
  ) =>
    setTransports((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );

  /* =====================================================================================
     HANDLERS: MANAGEMENT CHECKBOXES
  ===================================================================================== */

  const toggleManagement = (key: keyof ManagementRequirements) => {
    setManagement((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }));
  };

  const setManagementField = (key: keyof ManagementRequirements, value: any) =>
    setManagement((prev) => ({ ...prev, [key]: value }));

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
    if (!main.event_name.trim()) {
      toast.error("Event name is required");
      return false;
    }
    if (!main.event_type.trim()) {
      toast.error("Event type is required");
      return false;
    }
    if (!main.date_from) {
      toast.error("Start date is required");
      return false;
    }
    if (!main.time_from) {
      toast.error("Start time is required");
      return false;
    }
    if (!main.venue.trim()) {
      toast.error("Venue is required");
      return false;
    }

    // End date logic
    if (
      main.date_to &&
      new Date(main.date_to).getTime() < new Date(main.date_from).getTime()
    ) {
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
          toast.error(`Staff row ${i + 1} must have a valid staff count`);
          return false;
        }
      }
    }

    // Transport validation
    for (let i = 0; i < transports.length; i++) {
      const t = transports[i];
      if (t.no_of_persons !== "" && (+t.no_of_persons <= 0 || isNaN(+t.no_of_persons))) {
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
        toast.error("Enter valid number of persons for refreshment");
        return false;
      }
    }

    return true;
  };

  /* =====================================================================================
     SUBMIT FORM
  ===================================================================================== */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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

      // MAIN FIELDS
      fd.append("society_id", String(societyId));
      fd.append("submitted_by", String(userId));

      Object.entries(main).forEach(([k, v]) => {
        fd.append(k, v ?? "");
      });

      // PARTICIPANTS - Match backend field names
      fd.append(
        "student_participants",
        JSON.stringify(includeStudents ? students : [])
      );
      fd.append(
        "staff_participants",
        JSON.stringify(includeStaff ? staff : [])
      );
      
      // TRANSPORT
      fd.append("transport_requests", JSON.stringify(transports));
      
      // MANAGEMENT REQUIREMENTS
      fd.append("management_requirements", JSON.stringify(management));

      // DOCUMENTS - Append with specific field names
      documents.brochure.forEach((file) => fd.append("brochure", file));
      documents.script.forEach((file) => fd.append("script", file));
      documents.schedule.forEach((file) => fd.append("schedule", file));
      documents.invitation.forEach((file) => fd.append("invitation", file));
      documents.guest_profile.forEach((file) => fd.append("guest_profile", file));
      documents.other.forEach((file) => fd.append("other", file));

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/society/event-request/create`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success("Event Request Submitted Successfully!");

        // RESET FORM
        setMain({
          event_name: "",
          event_type: "",
          date_from: "",
          date_to: "",
          time_from: "",
          time_to: "",
          venue: "",
          collaborating_org: "",
          sponsor_name: "",
          sponsor_amount: "",
          coordinator_name: "",
          coordinator_contact: "",
          media_coverage: "",
        });

        setStudents([{ ...defaultStudent }]);
        setStaff([{ ...defaultStaff }]);
        setTransports([]);
        setManagement({ ...defaultManagement });
        setDocuments({
          brochure: [],
          script: [],
          schedule: [],
          invitation: [],
          guest_profile: [],
          other: [],
        });
        setIncludeStudents(true);
        setIncludeStaff(false);
        setHasGuestSpeaker(false);

        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        toast.error(res.data.message || "Failed to submit");
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

  const Header = () => (
    <div className="flex items-center mb-4">
      <FileText className="mr-2 h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">Complete Event Request Form</h3>
    </div>
  );

  /* STUDENT SECTION */
  const StudentSection = () => (
    <div className="space-y-2 border rounded p-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Student Participants</h4>
        <Button variant="ghost" size="sm" onClick={addStudent}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {students.map((s, i) => (
        <div key={i} className="grid md:grid-cols-4 gap-3 items-end">
          <div>
            <Label>Academic Program</Label>
            <Input
              value={s.academic_program}
              onChange={(e) =>
                updateStudent(i, "academic_program", e.target.value)
              }
              placeholder="e.g., BSCS"
            />
          </div>
          <div>
            <Label>Semester</Label>
            <Input
              value={s.semester}
              onChange={(e) => updateStudent(i, "semester", e.target.value)}
              placeholder="e.g., 3rd"
            />
          </div>
          <div>
            <Label>No. of Students</Label>
            <Input
              type="number"
              value={s.no_of_students as any}
              onChange={(e) =>
                updateStudent(
                  i,
                  "no_of_students",
                  e.target.value ? Number(e.target.value) : ""
                )
              }
            />
          </div>
          <div className="flex items-end pb-1">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeStudent(i)}
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  /* STAFF SECTION */
  const StaffSection = () => (
    <div className="space-y-2 border rounded p-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Staff Participants</h4>
        <Button variant="ghost" size="sm" onClick={addStaff}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {staff.map((st, i) => (
        <div key={i} className="grid md:grid-cols-4 gap-3 items-end">
          <div>
            <Label>Department</Label>
            <Input
              value={st.department}
              onChange={(e) => updateStaff(i, "department", e.target.value)}
              placeholder="e.g., Computer Science"
            />
          </div>
          <div>
            <Label>Gazetted</Label>
            <Select
              value={st.gazetted}
              onValueChange={(v) => updateStaff(i, "gazetted", v as any)}
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
              value={st.no_of_staff as any}
              onChange={(e) =>
                updateStaff(
                  i,
                  "no_of_staff",
                  e.target.value ? Number(e.target.value) : ""
                )
              }
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeStaff(i)}
            >
              <X className="mr-1 h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  /* MANAGEMENT SECTION */
  const ManagementSection = () => (
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
            <Input
              placeholder="Arrangement details"
              value={management.special_arrangements_detail}
              onChange={(e) =>
                setManagementField("special_arrangements_detail", e.target.value)
              }
            />
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
              <Input
                placeholder="Category (Tea/Lunch/Dinner)"
                value={management.refreshment_category}
                onChange={(e) =>
                  setManagementField("refreshment_category", e.target.value)
                }
              />
              <Input
                type="number"
                placeholder="Number of persons"
                value={management.refreshment_persons as any}
                onChange={(e) =>
                  setManagementField(
                    "refreshment_persons",
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              />
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

  /* TRANSPORT SECTION */
  const TransportSection = () => (
    <div className="space-y-2 border rounded p-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Transport Requests</h4>
        <Button variant="ghost" size="sm" onClick={addTransport}>
          <Plus className="mr-1 h-4 w-4" /> Add Transport
        </Button>
      </div>

      {transports.length === 0 && (
        <p className="text-sm text-gray-500">No transport added yet.</p>
      )}

      {transports.map((t, i) => (
        <div key={i} className="border rounded p-3 space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>Vehicle Type</Label>
              <Input
                value={t.vehicle_type}
                onChange={(e) =>
                  updateTransport(i, "vehicle_type", e.target.value)
                }
                placeholder="Car, Van, Bus"
              />
            </div>
            <div>
              <Label>Purpose</Label>
              <Input
                value={t.purpose}
                onChange={(e) => updateTransport(i, "purpose", e.target.value)}
                placeholder="Guest pickup, Field visit..."
              />
            </div>
            <div>
              <Label>No. of Persons</Label>
              <Input
                type="number"
                value={t.no_of_persons as any}
                onChange={(e) =>
                  updateTransport(
                    i,
                    "no_of_persons",
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>Destination</Label>
              <Input
                value={t.destination}
                onChange={(e) =>
                  updateTransport(i, "destination", e.target.value)
                }
                placeholder="Location"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={t.date}
                onChange={(e) => updateTransport(i, "date", e.target.value)}
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={t.time}
                onChange={(e) => updateTransport(i, "time", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeTransport(i)}
            >
              <X className="mr-1 h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  /* FILE UPLOAD SECTION */
  const DocumentSection = () => {
    const totalFiles =
      documents.brochure.length +
      documents.script.length +
      documents.schedule.length +
      documents.invitation.length +
      documents.guest_profile.length +
      documents.other.length;

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

        {/* Guest Speaker Documents - only if enabled */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">Guest Speaker / Trainer</Label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={hasGuestSpeaker}
                onChange={() => setHasGuestSpeaker((prev) => !prev)}
              />
              Has guest speaker / trainer
            </label>
          </div>

          {hasGuestSpeaker && (
            <>
              <p className="text-sm text-gray-600">
                Upload Guest Profile, Speech Draft, or Training Module
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Guest Profile</Label>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={(e) =>
                      handleFileGroup("guest_profile", e.target.files)
                    }
                  />
                  {documents.guest_profile.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm mt-1 p-1 bg-gray-50 rounded"
                    >
                      <span className="truncate">{f.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument("guest_profile", i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <Label>Other Documents</Label>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileGroup("other", e.target.files)}
                  />
                  {documents.other.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm mt-1 p-1 bg-gray-50 rounded"
                    >
                      <span className="truncate">{f.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument("other", i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
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
     FINAL FORM UI
  ===================================================================================== */

  const form = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic event info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Event Name *</Label>
          <Input
            name="event_name"
            value={main.event_name}
            onChange={handleMainChange}
            placeholder="e.g., Tech Innovation Summit"
          />
        </div>
        <div>
          <Label>Event Type *</Label>
          <Input
            name="event_type"
            value={main.event_type}
            onChange={handleMainChange}
            placeholder="Seminar, Workshop, Lecture..."
          />
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
              min={new Date().toISOString().split("T")[0]}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label>End Date</Label>
          <Input
            name="date_to"
            type="date"
            value={main.date_to}
            onChange={handleMainChange}
            min={main.date_from || ""}
          />
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
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label>End Time</Label>
          <Input
            name="time_to"
            type="time"
            value={main.time_to}
            onChange={handleMainChange}
          />
        </div>
      </div>

      {/* Venue */}
      <div>
        <Label>Venue *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            name="venue"
            value={main.venue}
            onChange={handleMainChange}
            className="pl-10"
            placeholder="Auditorium, Lab 301, Ground..."
          />
        </div>
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

      {/* Participant toggles */}
      <div className="border rounded p-4 space-y-3">
        <h4 className="font-medium">Participants</h4>
        <p className="text-xs text-gray-500">
          Choose which participant groups you want to include for this event.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={includeStudents}
              onChange={() => setIncludeStudents((prev) => !prev)}
            />
            <span className="text-sm">Include Student Participants</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={includeStaff}
              onChange={() => setIncludeStaff((prev) => !prev)}
            />
            <span className="text-sm">Include Staff Participants</span>
          </label>
        </div>
      </div>

      {/* SECTIONS */}
      {includeStudents && <StudentSection />}
      {includeStaff && <StaffSection />}
      <ManagementSection />
      <TransportSection />
      <DocumentSection />

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="min-w-[180px]">
          {loading ? (
            "Submitting..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Submit Request
            </>
          )}
        </Button>
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