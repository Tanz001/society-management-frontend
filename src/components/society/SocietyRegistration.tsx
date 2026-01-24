import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Upload, Plus, X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(3, "Society name must be at least 3 characters").nonempty("Society name is required"),
  description: z.string().min(50, "Description must be at least 50 characters").nonempty("Description is required"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(1, "Location is required"),
  advisor: z.string().min(1, "Faculty advisor is required"), // Will store faculty_id as string
  purpose: z.string().min(30, "Purpose must be at least 30 characters"),
  achievements: z.array(z.string()).optional(),
  events: z.array(z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
  })).optional(),
  terms: z.boolean().optional(),
});

const SocietyRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [events, setEvents] = useState<Array<{title: string, description: string, date: string}>>([]);
  const [savedFormData, setSavedFormData] = useState<z.infer<typeof formSchema>>({
    name: "",
    description: "", // important: never undefined
    category: "",
    location: "",
    advisor: "",
    purpose: "",
    achievements: [],
    events: [],
    terms: false,
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: savedFormData,
    shouldUnregister: false,
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "all",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get return path from location state; default depends on role (Board Secretary vs student)
  const userFromStorage = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userRoles = Array.isArray(userFromStorage.roles) ? userFromStorage.roles : [];
  const isBoardSecretary = userRoles.some(
    (r: any) => String(r.role_name || "").toLowerCase() === "board_secretary"
  );
  const defaultReturnPath = isBoardSecretary ? "/dashboard/admin/board-secretary" : "/dashboard/society";
  const returnPath = (location.state as any)?.returnTo || defaultReturnPath;
  const [societyLogo, setSocietyLogo] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [faculty, setFaculty] = useState<Array<{ faculty_id: number; name: string; email: string; dept?: string }>>([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [facultyComboboxOpen, setFacultyComboboxOpen] = useState(false);

  // ✅ Fetch all faculty on component load
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoadingFaculty(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/faculty`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Filter only active faculty
          const activeFaculty = (response.data.faculty || []).filter(
            (f: { is_active: number }) => f.is_active === 1
          );
          setFaculty(activeFaculty);
        }
      } catch (error) {
        console.error("Error fetching faculty:", error);
        toast({
          title: "Error",
          description: "Failed to load faculty. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoadingFaculty(false);
      }
    };

    fetchFaculty();
  }, []);

  // ✅ Check authentication state and role on component load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    console.log("SocietyRegistration - Authentication check:");
    console.log("Token exists:", !!token);
    console.log("User exists:", !!user);
    console.log("Token value:", token);
    console.log("User value:", user);
    
    if (!token || !user) {
      console.error("User not authenticated, redirecting to login");
      navigate("/");
      return;
    }

    // ✅ Check if user is Board Secretary - only Board Secretary can register societies
    try {
      const userData = JSON.parse(user);
      const roles = userData.roles || [];
      const isBoardSecretary = roles.some(
        (r: any) => String(r.role_name || "").toLowerCase() === "board_secretary"
      );

      console.log("User roles:", roles);
      console.log("Is Board Secretary:", isBoardSecretary);

      if (!isBoardSecretary) {
        console.error("User is not Board Secretary, redirecting to dashboard");
        toast({
          title: "Access Denied",
          description: "Only Board Secretary can register societies.",
          variant: "destructive",
        });
        navigate("/dashboard/admin/board-secretary");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/");
    }
  }, [navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      
      // Validate file size
      if (file.size > maxSize) {
        const fileType = type === 'logo' ? 'logo' : 'cover photo';
        toast({
          title: "File too large",
          description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} size exceeds 5MB. Please choose a smaller file.`,
          variant: "destructive",
        });
        event.target.value = ''; // Reset input
        return;
      }
      
      // Validate file type
      if (!file.type.match(/^image\/(png|jpeg|jpg)$/i)) {
        const fileType = type === 'logo' ? 'logo' : 'cover photo';
        toast({
          title: "Invalid file type",
          description: `Invalid file type for ${fileType}. Please upload PNG or JPG images only.`,
          variant: "destructive",
        });
        event.target.value = ''; // Reset input
        return;
      }
      
      switch (type) {
        case 'logo':
          setSocietyLogo(file);
          break;
        case 'cover':
          setCoverPhoto(file);
          break;
      }
    }
  };
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submission started...........");
  
    try {
      setIsSubmitting(true);
  
      // ✅ Get user data
      const userStr = localStorage.getItem("user");
      console.log("User data from localStorage:", userStr);
      
      if (!userStr) {
        console.error("No user data found in localStorage");
        throw new Error("No user data found in localStorage");
      }
  
      // Verify user data exists (faculty_id will be extracted from JWT token on backend)
      try {
        const user = JSON.parse(userStr);
        console.log("Parsed user data:", user);
        console.log("Faculty ID from user:", user.faculty_id);
        
        // Verify user has faculty_id (for Board Secretary)
        if (!user.faculty_id) {
          console.warn("Faculty ID not found in user data, but will be extracted from JWT token");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast({
          title: "Error",
          description: "User not authenticated. Please login again.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
  
      // ✅ File validation
      if (!societyLogo || !coverPhoto) {
        toast({
          title: "Error",
          description: "Both society logo and cover photo are required",
          variant: "destructive",
        });
        return;
      }
  
      // ✅ Description validation
      if (values.description.length < 50) {
        toast({
          title: "Error",
          description: "Description must be at least 50 characters",
          variant: "destructive",
        });
        return;
      }
  
      // Validate all required fields
      if (!values.name || !values.description || !values.category || 
          !values.location || !values.advisor || !values.purpose) {
        throw new Error("All basic fields are required");
      }

      // Filter arrays before sending
      const filteredAchievements = achievements.filter(
        (achievement) => achievement && achievement.trim().length > 0
      );
      const filteredEvents = events.filter(
        (event) =>
          event.title && event.title.trim() &&
          event.description && event.description.trim() &&
          event.date && event.date.trim()
      );

      // Create FormData for mixed content (files + data)
      const payload = new FormData();
      
      // Append all text fields
      // Note: faculty_id is extracted from JWT token on backend, no need to send it
      Object.entries({
        name: values.name,
        description: values.description,
        category: values.category,
        location: values.location,
        advisor: values.advisor,
        purpose: values.purpose,
        terms: (values.terms ?? false).toString(),
        achievements: JSON.stringify(filteredAchievements),
        events: JSON.stringify(filteredEvents)
      }).forEach(([key, value]) => {
        payload.append(key, value);
      });
      
      console.log("FormData prepared. Faculty ID will be extracted from JWT token on backend.");

      // Append files
      payload.append("societyLogo", societyLogo);
      payload.append("coverPhoto", coverPhoto);
  
      // ✅ Debug log FormData
      for (const pair of payload.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }
  
       // ✅ Send request
       const token = localStorage.getItem("token");
       console.log("tokennnnnnnnnnnnnnn",token)
       if (!token) {
         throw new Error("No authentication token found");
       }

     console.log("Sending society registration request...");
     console.log("API URL:", `${import.meta.env.VITE_API_URL}/society/register`);
     
     const response = await axios.post(
       `${import.meta.env.VITE_API_URL}/society/register`,
       payload,
       {
         headers: {
           Authorization: `Bearer ${token}`, // Ensure proper Bearer token format
           'Content-Type': 'multipart/form-data',
         },
         withCredentials: true,
       }
     );
  
     console.log("Response status:", response.status);
     console.log("Response data:", response.data);
  
      // ✅ Success
      if (response.status === 201) {
        toast({
          title: "Success!",
          description: "Your society has been registered successfully.",
          variant: "default",
        });

        // If the logged-in user is Board Secretary, stay in admin dashboard
        try {
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          const roles = storedUser.roles || [];
          const isBoardSecretary = roles.some(
            (r: any) => String(r.role_name || "").toLowerCase() === "board_secretary"
          );

          if (isBoardSecretary) {
            navigate("/dashboard/admin/board-secretary");
          } 
        } catch {
         
        }
      }
    } catch (error: any) {
      console.error("=== SOCIETY REGISTRATION ERROR (Frontend) ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error stack:", error.stack);
      
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to register society. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const addAchievement = () => {
    setAchievements([...achievements, ""]);
  };

  const updateAchievement = (index: number, value: string) => {
    const updated = [...achievements];
    updated[index] = value;
    setAchievements(updated);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const addEvent = () => {
    setEvents([...events, { title: "", description: "", date: "" }]);
  };

  const updateEvent = (index: number, field: string, value: string) => {
    const updated = [...events];
    updated[index] = { ...updated[index], [field]: value };
    setEvents(updated);
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'description', 'category', 'location', 'advisor'];
        const values = form.getValues();
        console.log("Step 1 validation - Current values:", values);

        if (!values.name || values.name.trim().length < 3) {
          form.setError('name', {
            type: 'manual',
            message: !values.name ? 'Society name is required' : 'Society name must be at least 3 characters'
          });
          return false;
        }

        if (!values.description || values.description.trim().length < 1) {
          form.setError('description', {
            type: 'manual',
            message: 'Description is required'
          });
          return false;
        }

        if (!values.category) {
          form.setError('category', {
            type: 'manual',
            message: 'Category is required'
          });
          return false;
        }

        if (!values.location) {
          form.setError('location', {
            type: 'manual',
            message: 'Location is required'
          });
          return false;
        }

        if (!values.advisor) {
          form.setError('advisor', {
            type: 'manual',
            message: 'Faculty advisor is required'
          });
          return false;
        }
        break;

      case 2:
        fieldsToValidate = ['purpose'];
        const purpose = form.getValues('purpose');
        if (!purpose || purpose.length < 30) {
          form.setError('purpose', {
            type: 'manual',
            message: !purpose ? 'Purpose is required' : 'Purpose must be at least 30 characters'
          });
          return false;
        }
        break;

      case 3:
        return true;

      case 4:
        // Allow moving to step 5 without validation
        return true;

      case 5:
        // Only validate files if submitting the form
        const isSubmitting = form.formState.isSubmitting;
        if (!isSubmitting) {
          return true;
        }
        
        if (!societyLogo || !coverPhoto) {
          toast({
            title: "Error",
            description: "Both society logo and cover photo are required",
            variant: "destructive",
          });
          return false;
        }
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    if (!result) {
      console.log("Validation failed, current errors:", form.formState.errors);
      return false;
    }

    const currentValues = form.getValues();
    console.log("Validation passed, current values:", currentValues);
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();

    if (isValid && currentStep < totalSteps) {
      const currentValues = form.getValues();
      console.log("Current form values:", currentValues);

      // Ensure description is explicitly preserved (prefer current value, otherwise fallback)
      const descriptionValue = currentValues.description ?? savedFormData.description ?? "";

      const updatedSavedFormData = {
        ...savedFormData,
        ...currentValues,
        description: descriptionValue,
        achievements,
        events,
      };
      setSavedFormData(updatedSavedFormData);
      console.log("Updated saved form data:", updatedSavedFormData);

      // Reset form with the full merged values (do NOT use keepValues)
      form.reset(updatedSavedFormData);

      // Explicitly set description to be safe (helps when field is unmounted)
      form.setValue('description', updatedSavedFormData.description);

      // debug
      console.log("After reset, form values:", form.getValues());

      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-university-navy mb-2">Basic Information</h2>
              <p className="text-muted-foreground">Tell us about your society</p>
            </div>


            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                console.log("Name field value:", field.value);
                const charCount = field.value?.length || 0;
                const minChars = 3;
                const isValid = charCount >= minChars;
                return (
                  <FormItem>
                    <FormLabel>Society Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        name="name"
                        placeholder="e.g., Computer Science Society"
                        onChange={(e) => {
                          field.onChange(e);
                          console.log("Name changed to:", e.target.value);
                          form.setValue("name", e.target.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true
                          });
                        }}
                        value={field.value}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      <span className={isValid ? "text-green-600" : "text-muted-foreground"}>
                        {charCount > 0 ? `${charCount} / ${minChars} characters` : `Minimum ${minChars} characters required`}
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => {
                const charCount = field.value?.length || 0;
                const minChars = 50;
                const isValid = charCount >= minChars;
                return (
                  <FormItem>
                    <FormLabel>Short Description <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of your society..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      <span className={isValid ? "text-green-600" : "text-muted-foreground"}>
                        {charCount > 0 ? `${charCount} / ${minChars} characters` : `Minimum ${minChars} characters required`}
                        {charCount > 0 && !isValid && ` (${minChars - charCount} more needed)`}
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

          
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="University Level">University Level</SelectItem>
                        <SelectItem value="Department Level">Department Level</SelectItem>
                        <SelectItem value="Intermediate Level">Intermediate Level</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select whether this is a University Level, Department Level, or Intermediate Level society
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Location <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Engineering Building" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the primary location or building where your society operates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="advisor"
              render={({ field }) => {
                const selectedFaculty = faculty.find(
                  (f) => String(f.faculty_id) === field.value
                );
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Faculty Advisor <span className="text-red-500">*</span></FormLabel>
                    <Popover open={facultyComboboxOpen} onOpenChange={setFacultyComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={loadingFaculty || faculty.length === 0}
                          >
                            {loadingFaculty
                              ? "Loading faculty..."
                              : faculty.length === 0
                              ? "No faculty available"
                              : selectedFaculty
                              ? `${selectedFaculty.name}${selectedFaculty.email ? ` (${selectedFaculty.email})` : ""}`
                              : "Select a faculty member"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search faculty by name or email..." />
                          <CommandList>
                            <CommandEmpty>No faculty found.</CommandEmpty>
                            <CommandGroup>
                              {faculty.map((f) => (
                                <CommandItem
                                  value={`${f.name} ${f.dept || ""} ${f.email || ""}`}
                                  key={f.faculty_id}
                                  onSelect={() => {
                                    field.onChange(String(f.faculty_id));
                                    setFacultyComboboxOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      String(f.faculty_id) === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{f.name} {f.email ? `(${f.email})` : ""}</span>
                                    {f.dept && (
                                      <span className="text-xs text-muted-foreground">{f.dept}</span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Search and select a faculty member who will serve as the advisor for this society. The advisor role will be assigned to this faculty member for this society.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-university-navy mb-2">Purpose & Goals</h2>
              <p className="text-muted-foreground">What does your society aim to achieve?</p>
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => {
                const charCount = field.value?.length || 0;
                const minChars = 30;
                const isValid = charCount >= minChars;
                return (
                  <FormItem>
                    <FormLabel>Society Purpose <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the main purpose and goals of your society..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      <span className={isValid ? "text-green-600" : "text-muted-foreground"}>
                        {charCount > 0 ? `${charCount} / ${minChars} characters` : `Minimum ${minChars} characters required`}
                        {charCount > 0 && !isValid && ` (${minChars - charCount} more needed)`}
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-university-navy mb-2">Achievements</h2>
              <p className="text-muted-foreground">Share your society's accomplishments</p>
            </div>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Describe an achievement..."
                    value={achievement}
                    onChange={(e) => updateAchievement(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAchievement(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addAchievement}>
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-university-navy mb-2">Planned Events</h2>
              <p className="text-muted-foreground">What events do you plan to organize?</p>
            </div>

            <div className="space-y-6">
              {events.map((event, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Event {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEvent(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Event title"
                      value={event.title}
                      onChange={(e) => updateEvent(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Event description"
                      value={event.description}
                      onChange={(e) => updateEvent(index, 'description', e.target.value)}
                    />
                    <Input
                      type="date"
                      value={event.date}
                      onChange={(e) => updateEvent(index, 'date', e.target.value)}
                    />
                  </div>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={addEvent}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-university-navy mb-2">Media & Files</h2>
              <p className="text-muted-foreground">Upload images and documents</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-dashed border-2 border-muted-foreground/25 hover:border-university-gold transition-colors">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Society Logo <span className="text-red-500">*</span></h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your society's logo
                  </p>
                  <div className="text-xs text-muted-foreground mb-2 space-y-1">
                    <p className="font-medium">Requirements:</p>
                    <p>• Accepted formats: PNG, JPG, JPEG</p>
                    <p>• Maximum file size: <span className="font-semibold">5MB</span></p>
                    <p>• Recommended: Square image (1:1 ratio)</p>
                  </div>
                  {societyLogo && (
                    <div className="mb-2 space-y-1">
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Logo selected: {societyLogo.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Size: {(societyLogo.size / 1024 / 1024).toFixed(2)} MB
                        {societyLogo.size > 5 * 1024 * 1024 && (
                          <span className="text-red-500 ml-1">(Exceeds limit!)</span>
                        )}
                      </p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    className="hidden"
                    id="society-logo"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('society-logo')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </Card>

              <Card className="p-6 border-dashed border-2 border-muted-foreground/25 hover:border-university-gold transition-colors">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Cover Photo <span className="text-red-500">*</span></h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a cover photo for your society
                  </p>
                  <div className="text-xs text-muted-foreground mb-2 space-y-1">
                    <p className="font-medium">Requirements:</p>
                    <p>• Accepted formats: PNG, JPG, JPEG</p>
                    <p>• Maximum file size: <span className="font-semibold">5MB</span></p>
                    <p>• Recommended: Wide image (16:9 ratio)</p>
                  </div>
                  {coverPhoto && (
                    <div className="mb-2 space-y-1">
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Cover photo selected: {coverPhoto.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Size: {(coverPhoto.size / 1024 / 1024).toFixed(2)} MB
                        {coverPhoto.size > 5 * 1024 * 1024 && (
                          <span className="text-red-500 ml-1">(Exceeds limit!)</span>
                        )}
                      </p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleFileChange(e, 'cover')}
                    className="hidden"
                    id="cover-photo"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('cover-photo')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </Card>

            </div>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          // Use setTimeout to avoid the flushSync warning
                          setTimeout(() => {
                            field.onChange(checked);
                          }, 0);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm that all information provided is accurate and I agree to the university's 
                        society registration terms and conditions. I understand that false information may 
                        result in rejection of this application.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary text-white py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20"
                onClick={() => navigate(returnPath)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Society Registration</h1>
                <p className="text-white/80">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80 mb-2">Progress</div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Form {...form}>
            <Card className="p-8 shadow-card">
              {renderStep()}
            </Card>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (isSubmitting) return;
                    form.handleSubmit(onSubmit)();
                  }}
                  variant="university"
                  className="px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              ) : (
                <Button type="button" onClick={nextStep} variant="university">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </Form>
        </div>
      </section>
    </div>
  );
};

export default SocietyRegistration;
