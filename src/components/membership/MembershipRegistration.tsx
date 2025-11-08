import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, User, Mail, Phone, MapPin, GraduationCap, BookOpen, Calendar, CreditCard } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

interface MembershipRegistrationProps {
  societyName?: string;
  membershipFee?: number;
  onFeeUpdate?: (newFee: number) => void;
  isEditable?: boolean;
}

const MembershipRegistration = ({ 
  societyName = "Computer Science Society", 
  membershipFee = 250,
  onFeeUpdate,
  isEditable = false 
}: MembershipRegistrationProps) => {
  const { societyId } = useParams();
  const navigate = useNavigate();
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    university: "",
    department: "",
    semester: "",
    rollno: "",
    paymentFile: null as File | null
  });

  const [editableFee, setEditableFee] = useState(membershipFee);
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [membershipSettings, setMembershipSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

// Fetch membership settings from API
const fetchMembershipSettings = async (societyId: string) => {
  try {
    setLoadingSettings(true);
    console.log(`Fetching membership settings for society ID: ${societyId}`);

    const token = localStorage.getItem("token");
    console.log("token: ",token)
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `http://localhost:5000/society/membership/form`,
      { society_id: societyId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      const settings = response.data.data;
      setMembershipSettings(settings);
      setEditableFee(settings.membership_fee || 0);
      console.log("Membership settings fetched:", settings);
    } else {
      console.log("No membership settings found for this society");
      setMembershipSettings(null);
      setEditableFee(0);
    }
  } catch (error: any) {
    console.error("Error fetching membership settings:", error);
    setMembershipSettings(null);
    setEditableFee(0);
  } finally {
    setLoadingSettings(false);
  }
};

  // Load membership settings from localStorage or API
  useEffect(() => {
    // First try to load from localStorage (if coming from society dashboard)
    const settingsData = localStorage.getItem('membershipSettings');
    if (settingsData) {
      try {
        const parsedSettings = JSON.parse(settingsData);
        setMembershipSettings(parsedSettings);
        setEditableFee(parsedSettings.membership_fee || membershipFee);
        console.log('Membership settings loaded from localStorage:', parsedSettings);
        return; // Don't fetch from API if we have localStorage data
      } catch (error) {
        console.error('Error parsing membership settings from localStorage:', error);
      }
    }

    // If no localStorage data, fetch from API using societyId from URL params
    if (societyId) {
      fetchMembershipSettings(societyId);
    }
  }, [societyId]);

  // Fetch society data and load user data on component mount
  useEffect(() => {
    const fetchSocietyData = async () => {
      if (societyId) {
        try {
          setLoading(true);
          setError(null);
          
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No authentication token found");
          }

          const response = await axios.get(`http://localhost:5000/user/societies/${societyId}`, {
            
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("Society data fetched for membership:", response.data);
          setSociety(response.data.data || response.data.society || response.data);
        } catch (err: any) {
          console.error("Error fetching society data:", err);
          let errorMessage = "Failed to fetch society data";
          
          if (err.response?.status === 404) {
            errorMessage = "Society not found. Please check the society ID.";
          } else if (err.response?.status === 401) {
            errorMessage = "Authentication required. Please login again.";
          } else if (err.response?.status === 403) {
            errorMessage = "Access denied. You don't have permission to view this society.";
          } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    const loadUserData = () => {
      // Set default values for form fields - user will enter their own data
      setFormData(prev => ({
        ...prev,
        name: "",
        email: "",
        phone: "",
        university: "Government College University",
        department: "",
        semester: "",
        rollno: ""
      }));
    };

    fetchSocietyData();
    loadUserData();
  }, [societyId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      paymentFile: file
    }));
  };

  const handleFeeUpdate = () => {
    if (onFeeUpdate) {
      onFeeUpdate(editableFee);
    }
    setIsEditingFee(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const submitData = new FormData();
      submitData.append("user_id", "1"); // replace with actual user ID if available
      submitData.append("society_id", membershipSettings?.society_id || societyId || "");
      submitData.append("full_name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("university", formData.university);
      submitData.append("department", formData.department);
      submitData.append("semester", formData.semester);
      submitData.append("membership_fee", editableFee.toString());
      submitData.append("rollno", formData.rollno);
  
      if (formData.paymentFile) {
        submitData.append("payment_receipt", formData.paymentFile);
      } else {
        throw new Error("Payment receipt file is required");
      }
  
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
  
      const response = await axios.post(
        "http://localhost:5000/user/membership/submit",
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      console.log("Membership submission response:", response.data);
  
      const message = response.data?.message;
  
      // ✅ Case 1: Duplicate request (already submitted)
      if (message?.includes("already submitted")) {
        toast.warning("Request Already Submitted", {
          description: "You’ve already applied for this society. Wait for admin approval.",
          duration: 4000,
        });
        setIsSubmitting(false);
        return; // stop further execution
      }
  
      // ✅ Case 2: New successful submission
      if (response.status >= 200 && response.status < 300) {
        setSubmitSuccess(true);
        setIsSubmitting(false);
  
        toast.success("Application Submitted Successfully!", {
          description: "Your membership application has been sent and is under review.",
          duration: 2000,
        });
  
        setTimeout(() => navigate("/dashboard/student"), 2000);
      } else {
        throw new Error(message || "Submission failed");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error("Submission Failed", {
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to submit membership application",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-navy mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading society information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-university-navy mb-4">Error Loading Society</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="mr-2">
              Retry
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-university-navy mb-2">
            Join {membershipSettings?.society_name || society?.name || societyName}
          </h1>
          <p className="text-muted-foreground">
            Complete the form below to become a member of our society
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Membership Fee Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-card sticky top-8">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-university-gold mr-2" />
                <h3 className="text-lg font-semibold text-university-navy">Membership Fee</h3>
              </div>
              
              {isEditable ? (
                <div className="space-y-4">
                  {isEditingFee ? (
                    <div className="space-y-2">
                      <Label htmlFor="fee">Fee Amount (PKR)</Label>
                      <Input
                        id="fee"
                        type="number"
                        value={editableFee}
                        onChange={(e) => setEditableFee(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleFeeUpdate} className="flex-1">
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setEditableFee(membershipFee);
                            setIsEditingFee(false);
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-university-navy mb-2">
                        PKR {editableFee}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setIsEditingFee(true)}
                        className="w-full"
                      >
                        Edit Fee
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-3xl font-bold text-university-navy">
                  PKR {membershipSettings ? (membershipSettings.membership_fee || 0) : 0}
                </div>
              )}
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Payment Instructions:</strong>
                </p>
                
                {loadingSettings ? (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm text-muted-foreground">Loading payment details...</p>
                  </div>
                ) : membershipSettings && (membershipSettings.account_number || membershipSettings.account_title) ? (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-sm font-medium text-university-navy mb-2">Account Details:</p>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Account Number:</span> {membershipSettings.account_number || "Not set"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Account Title:</span> {membershipSettings.account_title || "Not set"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Amount:</span> PKR {membershipSettings.membership_fee || editableFee}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Payment details are not yet configured for this society. 
                      Please contact the society administrator for payment instructions.
                    </p>
                  </div>
                )}
                
                <ul className="text-sm text-muted-foreground mt-3 space-y-1">
                  {membershipSettings && (membershipSettings.account_number || membershipSettings.account_title) ? (
                    <>
                      <li>• Deposit the membership fee to the account above</li>
                      <li>• Upload payment receipt below</li>
                      <li>• Your membership will be activated after verification</li>
                      <li>• Keep your payment receipt for records</li>
                    </>
                  ) : (
                    <>
                      <li>• Contact society administrator for payment details</li>
                      <li>• Complete the form below with your information</li>
                      <li>• Your membership will be processed after payment confirmation</li>
                    </>
                  )}
                </ul>
              </div>
            </Card>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-university-navy flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rollno">Roll Number *</Label>
                      <Input
                        id="rollno"
                        value={formData.rollno}
                        onChange={(e) => handleInputChange("rollno", e.target.value)}
                        placeholder="Enter your roll number"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">University *</Label>
                    <Input
                      id="university"
                      value={formData.university}
                      onChange={(e) => handleInputChange("university", e.target.value)}
                      placeholder="Enter your university"
                      required
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-university-navy flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Academic Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                        placeholder="Enter your department"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester *</Label>
                      <Input
                        id="semester"
                        value={formData.semester}
                        onChange={(e) => handleInputChange("semester", e.target.value)}
                        placeholder="Enter your semester"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-university-navy flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Payment Receipt
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment">Upload Payment Receipt *</Label>
                    <Input
                      id="payment"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload a clear image or PDF of your payment receipt
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  {submitSuccess ? (
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-green-600 font-semibold mb-2">✅ Application Submitted Successfully!</div>
                      <p className="text-sm text-green-600">Your membership application has been sent and is under review.</p>
                      <p className="text-xs text-green-500 mt-2">Redirecting to dashboard...</p>
                    </div>
                  ) : (
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Application...
                        </>
                      ) : (
                        "Submit Membership Application"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipRegistration;


