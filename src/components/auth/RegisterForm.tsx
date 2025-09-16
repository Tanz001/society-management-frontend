import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap,
  Building,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationType, setRegistrationType] = useState<"student" | "society">("student");

  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    studentId: "",
    major: "",
    year: "",
    password: "",
    confirmPassword: ""
  });

  const [societyData, setSocietyData] = useState({
    societyName: "",
    category: "",
    description: "",
    purpose: "",
    presidentName: "",
    presidentEmail: "",
    presidentPhone: "",
    advisorName: "",
    advisorEmail: "",
    password: "",
    confirmPassword: ""
  });

  const handleStudentSubmit = () => {
    // Handle student registration
    console.log("Student registration:", studentData);
  };

  const handleSocietySubmit = () => {
    // Handle society registration
    console.log("Society registration:", societyData);
  };

  const societyCategories = [
    "Technology", "Business", "Cultural", "Sports", "Academic", 
    "Arts", "Environmental", "Social Service", "Religious", "Other"
  ];

  const yearLevels = [
    "Freshman", "Sophomore", "Junior", "Senior", "Graduate", "PhD"
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-university-navy mb-2">Join Our University</h1>
          <p className="text-muted-foreground">Create your account to access societies and events</p>
        </div>

        <Card className="p-8 shadow-card">
          <Tabs value={registrationType} onValueChange={(value) => setRegistrationType(value as "student" | "society")}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="student">Student Registration</TabsTrigger>
              <TabsTrigger value="society">Society Registration</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-6">
              <div className="text-center mb-6">
                <div className="bg-university-navy/10 p-4 rounded-full w-fit mx-auto mb-3">
                  <User className="h-8 w-8 text-university-navy" />
                </div>
                <h2 className="text-xl font-semibold text-university-navy">Student Account</h2>
                <p className="text-sm text-muted-foreground">Join societies and participate in events</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input
                    placeholder="Enter your first name"
                    value={studentData.firstName}
                    onChange={(e) => setStudentData({...studentData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input
                    placeholder="Enter your last name"
                    value={studentData.lastName}
                    onChange={(e) => setStudentData({...studentData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="student@university.edu"
                  value={studentData.email}
                  onChange={(e) => setStudentData({...studentData, email: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    value={studentData.phone}
                    onChange={(e) => setStudentData({...studentData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Student ID</label>
                  <Input
                    placeholder="STU2024001"
                    value={studentData.studentId}
                    onChange={(e) => setStudentData({...studentData, studentId: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Major</label>
                  <Input
                    placeholder="Computer Science"
                    value={studentData.major}
                    onChange={(e) => setStudentData({...studentData, major: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year Level</label>
                  <select 
                    className="w-full p-2 border rounded-md text-sm"
                    value={studentData.year}
                    onChange={(e) => setStudentData({...studentData, year: e.target.value})}
                  >
                    <option value="">Select year level</option>
                    {yearLevels.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={studentData.password}
                    onChange={(e) => setStudentData({...studentData, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={studentData.confirmPassword}
                    onChange={(e) => setStudentData({...studentData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <Button onClick={handleStudentSubmit} className="w-full" variant="university">
                <User className="h-4 w-4 mr-2" />
                Create Student Account
              </Button>
            </TabsContent>

            <TabsContent value="society" className="space-y-6">
              <div className="text-center mb-6">
                <div className="bg-university-gold/10 p-4 rounded-full w-fit mx-auto mb-3">
                  <Building className="h-8 w-8 text-university-gold" />
                </div>
                <h2 className="text-xl font-semibold text-university-navy">Society Registration</h2>
                <p className="text-sm text-muted-foreground">Register your society for university recognition</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Society Name</label>
                <Input
                  placeholder="Enter society name"
                  value={societyData.societyName}
                  onChange={(e) => setSocietyData({...societyData, societyName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select 
                  className="w-full p-2 border rounded-md text-sm"
                  value={societyData.category}
                  onChange={(e) => setSocietyData({...societyData, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  {societyCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm min-h-20"
                  placeholder="Briefly describe your society..."
                  value={societyData.description}
                  onChange={(e) => setSocietyData({...societyData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Purpose & Mission</label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm min-h-20"
                  placeholder="What is the purpose and mission of your society?"
                  value={societyData.purpose}
                  onChange={(e) => setSocietyData({...societyData, purpose: e.target.value})}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-university-navy mb-4">President Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">President Name</label>
                    <Input
                      placeholder="Full name of society president"
                      value={societyData.presidentName}
                      onChange={(e) => setSocietyData({...societyData, presidentName: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">President Email</label>
                      <Input
                        type="email"
                        placeholder="president@university.edu"
                        value={societyData.presidentEmail}
                        onChange={(e) => setSocietyData({...societyData, presidentEmail: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">President Phone</label>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        value={societyData.presidentPhone}
                        onChange={(e) => setSocietyData({...societyData, presidentPhone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-university-navy mb-4">Faculty Advisor (Optional)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Advisor Name</label>
                    <Input
                      placeholder="Dr. Jane Smith"
                      value={societyData.advisorName}
                      onChange={(e) => setSocietyData({...societyData, advisorName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Advisor Email</label>
                    <Input
                      type="email"
                      placeholder="advisor@university.edu"
                      value={societyData.advisorEmail}
                      onChange={(e) => setSocietyData({...societyData, advisorEmail: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={societyData.password}
                    onChange={(e) => setSocietyData({...societyData, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={societyData.confirmPassword}
                    onChange={(e) => setSocietyData({...societyData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-university-gold/10 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-university-gold mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-university-navy">Registration Process</p>
                    <p className="text-muted-foreground">
                      Your society registration will be reviewed by university administrators. 
                      You'll receive an email notification once approved.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSocietySubmit} className="w-full" variant="university">
                <Building className="h-4 w-4 mr-2" />
                Submit Society Registration
              </Button>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-university-navy hover:text-university-gold font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;