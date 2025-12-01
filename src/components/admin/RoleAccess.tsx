import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ShieldCheck, Users, Building2, ArrowLeft, Info } from "lucide-react";

interface Role {
  role_id: number;
  role_name: string;
  display_name?: string;
  description?: string;
}

interface SocietySummary {
  society_id: number;
  name: string;
  category: string;
  advisor?: string;
  status_id?: number;
}

interface Assignment {
  role_id: number;
  society_id: number | null;
  role_name?: string;
}

const facultyOptions = [
  { id: 201, name: "Dr. Sara Ahmed", email: "sara.ahmed@gcu.edu.pk", department: "Computer Science" },
  { id: 202, name: "Prof. Kamran Ali", email: "kamran.ali@gcu.edu.pk", department: "Business Administration" },
  { id: 203, name: "Ms. Ayesha Khan", email: "ayesha.khan@gcu.edu.pk", department: "Media & Arts" },
  { id: 204, name: "Dr. Bilal Qureshi", email: "bilal.qureshi@gcu.edu.pk", department: "Electrical Engineering" },
];

const RoleAccess = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [societies, setSocieties] = useState<SocietySummary[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number>(facultyOptions[0]?.id ?? 201);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [advisorSocietyIds, setAdvisorSocietyIds] = useState<number[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const advisorRoleId = useMemo(() => {
    return roles.find((role) => role.role_name?.toLowerCase() === "advisor")?.role_id ?? null;
  }, [roles]);

  const selectedFaculty = facultyOptions.find((faculty) => faculty.id === selectedFacultyId);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const [rolesResponse, societiesResponse] = await Promise.all([
          axios.get("http://localhost:5000/admin/roles", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/admin/roles/societies", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setRoles(rolesResponse.data.roles || []);
        setSocieties(societiesResponse.data.societies || []);
      } catch (error: any) {
        console.error("Error loading role access metadata:", error);
        toast({
          title: "Unable to load data",
          description: error.response?.data?.message || error.message || "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setMetaLoading(false);
      }
    };

    fetchMeta();
  }, [toast]);

  useEffect(() => {
    if (!selectedFacultyId || metaLoading) return;

    const fetchAssignments = async () => {
      try {
        setAssignmentsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          `http://localhost:5000/admin/roles/assignments/${selectedFacultyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const assignments: Assignment[] = response.data.assignments || [];
        const directRoles = assignments
          .filter((assignment) => !assignment.society_id)
          .map((assignment) => assignment.role_id);

        const advisorAssignments = assignments
          .filter(
            (assignment) =>
              assignment.society_id &&
              assignment.role_name?.toLowerCase() === "advisor"
          )
          .map((assignment) => assignment.society_id!) || [];

        setSelectedRoleIds(directRoles);
        setAdvisorSocietyIds(advisorAssignments);
      } catch (error: any) {
        console.error("Error loading assignments:", error);
        toast({
          title: "Unable to load assignments",
          description: error.response?.data?.message || error.message || "Please try again.",
          variant: "destructive",
        });
        setSelectedRoleIds([]);
        setAdvisorSocietyIds([]);
      } finally {
        setAssignmentsLoading(false);
      }
    };

    fetchAssignments();
  }, [selectedFacultyId, metaLoading, toast]);

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    setSelectedRoleIds((prev) =>
      checked ? [...prev, roleId] : prev.filter((id) => id !== roleId)
    );
  };

  const handleAdvisorToggle = (societyId: number, checked: boolean) => {
    setAdvisorSocietyIds((prev) =>
      checked ? [...prev, societyId] : prev.filter((id) => id !== societyId)
    );
  };

  const handleSaveAssignments = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const assignmentsPayload = [
        ...selectedRoleIds.map((role_id) => ({ role_id, society_id: null })),
        ...(advisorRoleId
          ? advisorSocietyIds.map((society_id) => ({
              role_id: advisorRoleId,
              society_id,
            }))
          : []),
      ];

      await axios.post(
        "http://localhost:5000/admin/roles/assignments",
        {
          faculty_id: selectedFacultyId,
          assignments: assignmentsPayload,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Role assignments saved",
        description: "The updated permissions are now in effect.",
      });
    } catch (error: any) {
      console.error("Error saving assignments:", error);
      toast({
        title: "Unable to save assignments",
        description: error.response?.data?.message || error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary text-white py-10 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm uppercase tracking-widest text-white/70">Super Admin</p>
              <h1 className="text-3xl font-bold">Role Based Access Control</h1>
              <p className="text-white/80">
                Assign platform permissions and advisor responsibilities from a single screen.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="text-white border-white hover:bg-white/20" asChild>
                <Link to="/dashboard/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-10 px-4">
        <div className="container mx-auto max-w-6xl space-y-6">
          <Card className="p-6 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-university-navy">Choose Faculty Member</h2>
                <p className="text-sm text-muted-foreground">
                  Select a faculty member to configure their platform access.
                </p>
              </div>
              <Select
                value={String(selectedFacultyId)}
                onValueChange={(value) => setSelectedFacultyId(Number(value))}
              >
                <SelectTrigger className="w-full md:w-80 bg-white">
                  <SelectValue placeholder="Select faculty member" />
                </SelectTrigger>
                <SelectContent>
                  {facultyOptions.map((faculty) => (
                    <SelectItem key={faculty.id} value={String(faculty.id)}>
                      {faculty.name} • {faculty.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedFaculty && (
              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-muted/40 border-none shadow-none">
                  <p className="text-xs uppercase text-muted-foreground">Name</p>
                  <p className="font-semibold text-university-navy">{selectedFaculty.name}</p>
                </Card>
                <Card className="p-4 bg-muted/40 border-none shadow-none">
                  <p className="text-xs uppercase text-muted-foreground">Email</p>
                  <p className="font-semibold text-university-navy">{selectedFaculty.email}</p>
                </Card>
                <Card className="p-4 bg-muted/40 border-none shadow-none">
                  <p className="text-xs uppercase text-muted-foreground">Department</p>
                  <p className="font-semibold text-university-navy">{selectedFaculty.department}</p>
                </Card>
              </div>
            )}
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-university-navy flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-university-gold" />
                    Platform Roles
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Toggle the system-wide capabilities this faculty member should have.
                  </p>
                </div>
                {(metaLoading || assignmentsLoading) && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              </div>

              {metaLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading roles...
                </div>
              ) : roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No roles found in the system.</p>
              ) : (
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div
                      key={role.role_id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm text-university-navy">
                          {role.display_name || role.role_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {role.description || "No description available"}
                        </p>
                      </div>
                      <Switch
                        checked={selectedRoleIds.includes(role.role_id)}
                        onCheckedChange={(checked) => handleRoleToggle(role.role_id, checked)}
                        disabled={assignmentsLoading || saving}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-university-navy flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-university-navy" />
                    Advisor Assignments
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Assign this faculty member as advisor for one or more societies.
                  </p>
                </div>
                {(metaLoading || assignmentsLoading) && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              </div>

              {!advisorRoleId && (
                <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                  <Info className="h-4 w-4 mt-0.5" />
                  Advisor role was not found. Please add an "advisor" entry to the roles table to enable society assignments.
                </div>
              )}

              {metaLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading societies...
                </div>
              ) : societies.length === 0 ? (
                <p className="text-sm text-muted-foreground">No societies found.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {societies.map((society) => (
                    <div key={society.society_id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-university-navy">{society.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{society.category}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          ID: {society.society_id}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Advisor: {society.advisor || "Unassigned"}</span>
                        <Switch
                          checked={advisorSocietyIds.includes(society.society_id)}
                          onCheckedChange={(checked) => handleAdvisorToggle(society.society_id, checked)}
                          disabled={!advisorRoleId || assignmentsLoading || saving}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="p-6 shadow-card space-y-4">
            <h3 className="text-lg font-semibold text-university-navy flex items-center gap-2">
              <Users className="h-5 w-5 text-university-maroon" />
              Current Summary
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground mb-2">Active Roles</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRoleIds.length === 0 ? (
                    <Badge variant="secondary">No roles selected</Badge>
                  ) : (
                    selectedRoleIds.map((roleId) => {
                      const role = roles.find((r) => r.role_id === roleId);
                      return (
                        <Badge key={roleId} variant="secondary">
                          {role?.display_name || role?.role_name || `Role ${roleId}`}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground mb-2">Advisor For</p>
                <div className="flex flex-wrap gap-2">
                  {advisorSocietyIds.length === 0 ? (
                    <Badge variant="outline">No societies assigned</Badge>
                  ) : (
                    advisorSocietyIds.map((societyId) => {
                      const society = societies.find((s) => s.society_id === societyId);
                      return (
                        <Badge key={societyId} variant="outline">
                          {society?.name || `Society ${societyId}`}
                        </Badge>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="university"
                size="lg"
                onClick={handleSaveAssignments}
                disabled={saving || assignmentsLoading}
                className="w-full md:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Role Assignments"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default RoleAccess;

