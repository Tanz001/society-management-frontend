import React, { useState, useMemo, memo, useEffect } from "react";
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
            venue_id: data.venue_id ? String(data.venue_id) : "",
            collaborating_org: data.collaborating_org || "",
            sponsor_name: data.sponsor_name || "",
            sponsor_amount: data.sponsor_amount || "",
            coordinator_name: data.coordinator_name || "",
            coordinator_contact: data.coordinator_contact || "",
            media_coverage: data.media_coverage || "",
          });

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

          // Note: Documents are not loaded as they are files - user can re-upload if needed
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

  // Fetch occupied slots when venue and date are selected
  useEffect(() => {
    const fetchOccupiedSlots = async () => {
      if (!main.venue_id || !main.date_from) {
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
    
    return occupiedSlots.some((slot) => {
      const slotFrom = normalizeTime(slot.time_from);
      const slotTo = normalizeTime(slot.time_to);
      
      if (!slotFrom || !slotTo) return false;
      
      // Convert to minutes for easier comparison
      const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const reqStart = timeToMinutes(normalizedFrom);
      const reqEnd = timeToMinutes(normalizedTo);
      const slotStart = timeToMinutes(slotFrom);
      const slotEnd = timeToMinutes(slotTo);
      
      // Check for any overlap: two time ranges overlap if one starts before the other ends
      // and one ends after the other starts
      return (reqStart < slotEnd && reqEnd > slotStart);
    });
  };

  // State to track if current time slot is occupied
  const [timeSlotError, setTimeSlotError] = useState<string>("");
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  
  const steps = [
    { number: 1, title: "Basic Information", completed: false },
    { number: 2, title: "Student Participants", completed: false },
    { number: 3, title: "Staff Participants", completed: false },
    { number: 4, title: "Management Requirements", completed: false },
    { number: 5, title: "Transport Requests", completed: false },
    { number: 6, title: "Documents", completed: false },
  ];
  
  const nextStep = () => {
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
      setCurrentStep(step);
    }
  };

  /* =====================================================================================
     HANDLERS: MAIN FIELDS
  ===================================================================================== */

  const handleMainChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMain((prev) => {
      const updated = { ...prev, [name]: value };
      
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
    setMain((prev) => ({ ...prev, venue_id: venueId }));
  };

  /* =====================================================================================
     HANDLERS: STUDENTS
  ===================================================================================== */

  const addStudent = () => {
    setStudents((prev) => [...prev, { ...defaultStudent, id: genId() }]);
  };
  const removeStudent = (index: number) =>
    setStudents((prev) => prev.filter((_, i) => i !== index));
  const updateStudent = (
    index: number,
    field: keyof StudentRow,
    value: any
  ) => {
    setStudents((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  /* =====================================================================================
     HANDLERS: STAFF
  ===================================================================================== */

  const addStaff = () => {
    setStaff((prev) => [...prev, { ...defaultStaff, id: genId() }]);
  };
  const removeStaff = (index: number) =>
    setStaff((prev) => prev.filter((_, i) => i !== index));
  const updateStaff = (index: number, field: keyof StaffRow, value: any) => {
    setStaff((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  /* =====================================================================================
     HANDLERS: TRANSPORT
  ===================================================================================== */

  const addTransport = () => {
    setTransports((prev) => [...prev, { ...defaultTransport, id: genId() }]);
  };
  const removeTransport = (index: number) =>
    setTransports((prev) => prev.filter((_, i) => i !== index));
  const updateTransport = (
    index: number,
    field: keyof TransportRow,
    value: any
  ) => {
    setTransports((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
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
    if (!main.venue_id) {
      toast.error("Venue is required");
      return false;
    }

    // Check if selected time slot is occupied
    if (main.time_from && main.time_to) {
      if (isTimeSlotOccupied(main.time_from, main.time_to)) {
        toast.error("The selected time slot overlaps with an occupied slot. Please choose a different time.");
        setTimeSlotError("This time slot overlaps with an occupied slot. Please choose a different time.");
        return false;
      }
    }
    
    // Also check if time_to is required when time_from is set
    if (main.time_from && !main.time_to) {
      toast.error("End time is required when start time is set.");
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
    e.stopPropagation();
    
    // Prevent submission if not on the last step - double check
    if (currentStep !== totalSteps) {
      console.warn(`Form submission blocked: Current step is ${currentStep}, but must be ${totalSteps}`);
      toast.error(`Please complete all steps before submitting. You are on step ${currentStep} of ${totalSteps}`);
      return;
    }
    
    // Additional safety check
    if (currentStep < totalSteps) {
      console.warn(`Form submission blocked: Current step ${currentStep} is less than total steps ${totalSteps}`);
      return;
    }
    
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
      
      // MANAGEMENT REQUIREMENTS
      fd.append("management_requirements", JSON.stringify(management));

      // DOCUMENTS - Append with specific field names
      documents.brochure.forEach((file) => fd.append("brochure", file));
      documents.script.forEach((file) => fd.append("script", file));
      documents.schedule.forEach((file) => fd.append("schedule", file));
      documents.invitation.forEach((file) => fd.append("invitation", file));
      documents.guest_profile.forEach((file) => fd.append("guest_profile", file));
      documents.other.forEach((file) => fd.append("other", file));

      let res;
      if (isEditMode && reqId) {
        // Update existing event request
        fd.append("req_id", String(reqId));
        res = await axios.put(
          `${import.meta.env.VITE_API_URL}/society/event-request/update`,
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
          `${import.meta.env.VITE_API_URL}/society/event-request/create`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

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

  const Header = () => (
    <div className="flex items-center mb-4">
      <FileText className="mr-2 h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">Complete Event Request Form</h3>
    </div>
  );

  // Student Row Component (memoized to prevent re-renders)
  const StudentRow = memo(({ student, index, onUpdate, onRemove }: {
    student: StudentRow;
    index: number;
    onUpdate: (index: number, field: keyof StudentRow, value: any) => void;
    onRemove: (index: number) => void;
  }) => {

    return (
      <div className="grid md:grid-cols-4 gap-3 items-end">
        <div>
          <Label>Academic Program</Label>
          <Input
            value={student.academic_program}
            onChange={(e) => onUpdate(index, "academic_program", e.target.value)}
            placeholder="e.g., BSCS"
          />
        </div>
        <div>
          <Label>Semester</Label>
          <Input
            value={student.semester}
            onChange={(e) => onUpdate(index, "semester", e.target.value)}
            placeholder="e.g., 3rd"
          />
        </div>
        <div>
          <Label>No. of Students</Label>
          <Input
            type="number"
            value={student.no_of_students}
            onChange={(e) => onUpdate(index, "no_of_students", e.target.value)}
          />
        </div>
        <div className="flex items-end pb-1">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(index)}
          >
            <X className="mr-1 h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    );
  });

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
        <StudentRow
          key={s.id}
          student={s}
          index={i}
          onUpdate={updateStudent}
          onRemove={removeStudent}
        />
      ))}

 
    </div>

  );

  // Staff Row Component (memoized)
  const StaffRow = memo(({ staffMember, index, onUpdate, onRemove }: {
    staffMember: StaffRow;
    index: number;
    onUpdate: (index: number, field: keyof StaffRow, value: any) => void;
    onRemove: (index: number) => void;
  }) => {

    return (
      <div className="grid md:grid-cols-4 gap-3 items-end">
        <div>
          <Label>Department</Label>
          <Input
            value={staffMember.department}
            onChange={(e) => onUpdate(index, "department", e.target.value)}
            placeholder="e.g., Computer Science"
          />
        </div>
        <div>
          <Label>Gazetted</Label>
          <Select
            value={staffMember.gazetted}
            onValueChange={(v) => onUpdate(index, "gazetted", v as any)}
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
            value={staffMember.no_of_staff}
            onChange={(e) => onUpdate(index, "no_of_staff", e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(index)}
          >
            <X className="mr-1 h-4 w-4" /> Remove
          </Button>
        </div>
      </div>
    );
  });

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
        <StaffRow
          key={st.id}
          staffMember={st}
          index={i}
          onUpdate={updateStaff}
          onRemove={removeStaff}
        />
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

  // Transport Row Component (memoized)
  const TransportRow = memo(({ transport, index, onUpdate, onRemove }: {
    transport: TransportRow;
    index: number;
    onUpdate: (index: number, field: keyof TransportRow, value: any) => void;
    onRemove: (index: number) => void;
  }) => {

    return (
      <div className="border rounded p-3 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Vehicle Type</Label>
            <Input
              value={transport.vehicle_type}
              onChange={(e) => onUpdate(index, "vehicle_type", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              placeholder="Car, Van, Bus"
            />
          </div>
          <div>
            <Label>Purpose</Label>
            <Input
              value={transport.purpose}
              onChange={(e) => onUpdate(index, "purpose", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              placeholder="Guest pickup, Field visit..."
            />
          </div>
          <div>
            <Label>No. of Persons</Label>
            <Input
              type="number"
              value={transport.no_of_persons}
              onChange={(e) => onUpdate(index, "no_of_persons", e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Destination</Label>
            <Input
              value={transport.destination}
              onChange={(e) => onUpdate(index, "destination", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              placeholder="Location"
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={transport.date}
              onChange={(e) => onUpdate(index, "date", e.target.value)}
            />
          </div>
          <div>
            <Label>Time</Label>
            <Input
              type="time"
              value={transport.time}
              onChange={(e) => onUpdate(index, "time", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(index);
            }}
          >
            <X className="mr-1 h-4 w-4" /> Remove
          </Button>
        </div>
      </div>
    );
  });

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
        <TransportRow
          key={t.id}
          transport={t}
          index={i}
          onUpdate={updateTransport}
          onRemove={removeTransport}
        />
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
     STEP NAVIGATION
  ===================================================================================== */
  
  const StepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => goToStep(step.number)}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep === step.number
                    ? "bg-university-navy text-white border-university-navy"
                    : currentStep > step.number
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-400 border-gray-300"
                }`}
              >
                {currentStep > step.number ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </button>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep === step.number
                    ? "text-university-navy"
                    : currentStep > step.number
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  currentStep > step.number ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

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
                    className={`pl-10 ${timeSlotError ? 'border-red-500' : ''}`}
                  />
                </div>
                {timeSlotError && main.time_from && main.time_to && (
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
                  className={timeSlotError ? 'border-red-500' : ''}
                />
                {timeSlotError && main.time_from && main.time_to && (
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
                    onValueChange={handleVenueChange}
                    disabled={loadingVenues}
                  >
                    <SelectTrigger className="pl-10">
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
              </div>

              {/* Display occupied slots */}
              {main.venue_id && main.date_from && (
                <div className="border rounded p-3 bg-gray-50">
                  <Label className="text-sm font-semibold mb-2 block">
                    Occupied slots for {main.date_from}
                  </Label>
                  {loadingSlots ? (
                    <p className="text-sm text-gray-500">Loading slots...</p>
                  ) : occupiedSlots.length > 0 ? (
                    <div className="space-y-1">
                      {occupiedSlots.map((slot) => (
                        <div
                          key={slot.slot_id}
                          className="text-sm p-2 bg-red-50 border border-red-200 rounded"
                        >
                          <span className="font-medium">
                            {formatTimeToAMPM(slot.time_from)} - {slot.time_to ? formatTimeToAMPM(slot.time_to) : "N/A"}
                          </span>
                          <span className="ml-2 text-red-600">({slot.status_name})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">No occupied slots for this date</p>
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
            {includeStudents && <StudentSection />}
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
            {includeStaff && <StaffSection />}
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
            <ManagementSection />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-university-navy mb-4">
              Transport Requests
            </h3>
            <TransportSection />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-university-navy mb-4">
              Upload Documents
            </h3>
            <DocumentSection />
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
        
        // Only allow submission on the last step - strict check
        if (currentStep === totalSteps && currentStep === 6) {
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
              // Additional safety: only submit if on last step
              if (currentStep !== totalSteps) {
                e.preventDefault();
                e.stopPropagation();
                toast.error(`Please complete all steps. You are on step ${currentStep} of ${totalSteps}`);
                return false;
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