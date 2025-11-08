import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Upload, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(3, "Society name must be at least 3 characters").nonempty("Society name is required"),
  description: z.string().min(1, "Description is required"), // required
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(1, "Location is required"),
  advisor: z.string().min(1, "Faculty advisor is required"),
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [societyLogo, setSocietyLogo] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);

  // ✅ Check authentication state on component load
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
    }
  }, [navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    if (event.target.files) {
      switch (type) {
        case 'logo':
          setSocietyLogo(event.target.files[0]);
          break;
        case 'cover':
          setCoverPhoto(event.target.files[0]);
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
  
      let userId;
      try {
        const user = JSON.parse(userStr);
        console.log("Parsed user data:", user); // Debug log
        
        // Try different possible field names for user ID
        userId = user.id || user._id || user.userId || user.studentId;
        
        if (!userId) {
          console.error("User ID not found. Available fields:", Object.keys(user));
          throw new Error("User ID not found in parsed user data");
        }
        
        console.log("Found user ID:", userId);
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
      Object.entries({
        name: values.name,
        description: values.description,
        category: values.category,
        location: values.location,
        advisor: values.advisor,
        purpose: values.purpose,
        user_id: userId.toString(),
        terms: (values.terms ?? false).toString(),
        achievements: JSON.stringify(filteredAchievements),
        events: JSON.stringify(filteredEvents)
      }).forEach(([key, value]) => {
        payload.append(key, value);
      });

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

       const response = await axios.post(
         "http://localhost:5000/society/register",
         payload,
         {
           headers: {
             Authorization: `Bearer ${token}`, // Ensure proper Bearer token format
             'Content-Type': 'multipart/form-data',
           },
           withCredentials: true,
         }
       );
  
      // ✅ Success
      if (response.status === 201) {
        toast({
          title: "Success!",
          description: "Your society has been registered successfully.",
          variant: "default",
        });
        navigate("/dashboard/student");
      }
    } catch (error: any) {
      console.error("Error submitting society registration:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
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
                return (
                  <FormItem>
                    <FormLabel>Society Name</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of your society..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="social-impact">Social Impact</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Engineering Building" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="advisor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Advisor</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dr. Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Society Purpose</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the main purpose and goals of your society..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your society's logo (PNG, JPG)
                  </p>
                  {societyLogo && (
                    <p className="text-sm text-green-600 mb-2">
                      ✓ Logo selected: {societyLogo.name}
                    </p>
                  )}
                  <Input
                    type="file"
                    accept="image/png,image/jpeg"
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
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a cover photo for your society
                  </p>
                  {coverPhoto && (
                    <p className="text-sm text-green-600 mb-2">
                      ✓ Cover photo selected: {coverPhoto.name}
                    </p>
                  )}
                  <Input
                    type="file"
                    accept="image/png,image/jpeg"
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
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/20">
                <Link to="/dashboard/society">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
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
