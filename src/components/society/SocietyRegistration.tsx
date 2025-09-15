import { useState } from "react";
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
import { Link } from "react-router-dom";

const formSchema = z.object({
  name: z.string().min(3, "Society name must be at least 3 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
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
  tags: z.array(z.string()).min(1, "Add at least one tag"),
});

const SocietyRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [events, setEvents] = useState<Array<{title: string, description: string, date: string}>>([]);
  
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      location: "",
      advisor: "",
      purpose: "",
      achievements: [],
      events: [],
      tags: [],
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // Handle form submission
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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

  const nextStep = () => {
    if (currentStep < totalSteps) {
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Society Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer Science Society" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mt-2 mb-4">
                <Input
                  placeholder="Add tags..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
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
                  <h3 className="font-medium mb-2">Society Logo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload your society's logo (PNG, JPG)
                  </p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
              </Card>

              <Card className="p-6 border-dashed border-2 border-muted-foreground/25 hover:border-university-gold transition-colors">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Cover Photo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a cover photo for your society
                  </p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
              </Card>

              <Card className="p-6 border-dashed border-2 border-muted-foreground/25 hover:border-university-gold transition-colors md:col-span-2">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Additional Documents</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload constitution, certificates, or other documents
                  </p>
                  <Button variant="outline" size="sm">
                    Choose Files
                  </Button>
                </div>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox id="terms" />
                <label htmlFor="terms" className="text-sm leading-relaxed">
                  I confirm that all information provided is accurate and I agree to the university's 
                  society registration terms and conditions. I understand that false information may 
                  result in rejection of this application.
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Form */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="p-8 shadow-card">
                {renderStep()}
                
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
                    <Button type="submit" variant="university" className="px-8">
                      Submit Application
                    </Button>
                  ) : (
                    <Button type="button" onClick={nextStep} variant="university">
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </Card>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
};

export default SocietyRegistration;