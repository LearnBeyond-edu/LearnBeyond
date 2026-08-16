"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { useQueryClient } from "@tanstack/react-query";
import { SCHOOL_KEYS, useStudents, useClasses } from "@/hooks/useSchool";
import { useAuthStore } from "@/store/useAuthStore";
interface AddStaffDialogProps {
  role: "Teacher" | "Therapist" | "Student" | "Parent";
  institutionId: string;
  studentId?: string;
}

export function AddStaffDialog({ role, institutionId, studentId }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents(100);
  const { data: classesData } = useClasses(100);
  
  const allStudents = studentsData?.pages.flatMap(p => p.data) ?? [];
  const allClasses = classesData?.pages.flatMap(p => p.data) ?? [];
  
  // For teachers, prioritize their students. If they have no mapped classes yet, fallback to all students so the UI is testable.
  const myClasses = allClasses;
  const myClassIds = myClasses.map(c => c.id);
  
  let myStudents = user?.role === "Teacher" && myClassIds.length > 0
    ? allStudents.filter(s => myClassIds.includes(s.class_id))
    : allStudents;

  if (myStudents.length === 0) {
    myStudents = allStudents;
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    assignedClass: "",
    assignedSection: "",
    selectedStudentId: studentId || "",
    relation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let finalStudentId = formData.selectedStudentId;
      if (role === "Parent" && formData.selectedStudentId && !studentId) {
        const selectedStudent = myStudents.find(s => s.id === formData.selectedStudentId);
        if (selectedStudent && selectedStudent.user_id) {
          finalStudentId = selectedStudent.user_id;
        }
      }

      await authService.register({
        email: formData.email,
        password: formData.password,
        role: role,
        first_name: formData.firstName,
        last_name: formData.lastName,
        institution_id: institutionId,
        assigned_class: formData.assignedClass || undefined,
        assigned_section: formData.assignedSection || undefined,
        student_id: finalStudentId || undefined,
        relation: formData.relation || undefined,
      });
      toast.success(`${role} added successfully!`);
      setOpen(false);
      setFormData({ firstName: "", lastName: "", email: "", password: "", assignedClass: "", assignedSection: "", selectedStudentId: "", relation: "" });
      
      const queryKeyMap = {
        Teacher: SCHOOL_KEYS.teachers,
        Therapist: SCHOOL_KEYS.therapists,
        Student: SCHOOL_KEYS.students,
        Parent: SCHOOL_KEYS.parents
      };
      qc.invalidateQueries({ queryKey: queryKeyMap[role] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? `Failed to add ${role.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 shrink-0" />}>
        <Plus className="h-4 w-4" /> Add {role}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {role}</DialogTitle>
          <DialogDescription>
            Create a new account for a {role.toLowerCase()} in your institution.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                required
                placeholder="Jane"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                required
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              required
              type="email"
              placeholder="jane.doe@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Temporary Password</label>
            <Input
              required
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {role === "Teacher" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class Assignment</label>
                <Select
                  value={formData.assignedClass}
                  onValueChange={(value) => setFormData({ ...formData, assignedClass: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={`Class ${i + 1}`}>
                        Class {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Section Assignment</label>
                <Select
                  value={formData.assignedSection}
                  onValueChange={(value) => setFormData({ ...formData, assignedSection: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((char) => (
                      <SelectItem key={char} value={`Section ${char}`}>
                        Section {char}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {role === "Parent" && (
            <div className="grid grid-cols-2 gap-4">
              {!studentId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link to Student</label>
                  <Select
                    value={formData.selectedStudentId}
                    onValueChange={(value) => setFormData({ ...formData, selectedStudentId: value })}
                    disabled={isLoadingStudents}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {myStudents.length > 0 ? myStudents.map((s) => {
                        const displayName = [s.first_name, s.last_name].filter(Boolean).join(" ") || `Student (${s.id.slice(0, 5)})`;
                        return (
                          <SelectItem key={s.id} value={s.id}>
                            {displayName}
                          </SelectItem>
                        );
                      }) : (
                        <SelectItem value="none" disabled>
                          No students found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className={`space-y-2 ${studentId ? 'col-span-2' : ''}`}>
                <label className="text-sm font-medium">Relationship</label>
                <Select
                  value={formData.relation}
                  onValueChange={(value) => setFormData({ ...formData, relation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="e.g. Father" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : `Create ${role} Account`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
