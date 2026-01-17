import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Users, BookOpen, Loader2 } from "lucide-react";
import { useStore } from "@/store/store";
import { toast } from "sonner";

interface BatchOperationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BatchOperations: React.FC<BatchOperationsProps> = ({
  open,
  onOpenChange,
}) => {
  const { students, tests, deleteStudent, deleteTest } = useStore();
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteStudents, setConfirmDeleteStudents] = useState(false);
  const [confirmDeleteTests, setConfirmDeleteTests] = useState(false);
  const [activeTab, setActiveTab] = useState("students");

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleTest = (id: string) => {
    setSelectedTests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllStudents = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map((s) => s.id)));
    }
  };

  const selectAllTests = () => {
    if (selectedTests.size === tests.length) {
      setSelectedTests(new Set());
    } else {
      setSelectedTests(new Set(tests.map((t) => t.id)));
    }
  };

  const handleDeleteStudents = async () => {
    if (selectedStudents.size === 0) return;

    setIsDeleting(true);
    try {
      for (const id of selectedStudents) {
        await deleteStudent(id);
      }
      toast.success(`تم حذف ${selectedStudents.size} طالب بنجاح`);
      setSelectedStudents(new Set());
    } catch (error) {
      console.error("Error deleting students:", error);
      toast.error("حدث خطأ أثناء حذف الطلاب");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteStudents(false);
    }
  };

  const handleDeleteTests = async () => {
    if (selectedTests.size === 0) return;

    setIsDeleting(true);
    try {
      for (const id of selectedTests) {
        await deleteTest(id);
      }
      toast.success(`تم حذف ${selectedTests.size} اختبار بنجاح`);
      setSelectedTests(new Set());
    } catch (error) {
      console.error("Error deleting tests:", error);
      toast.error("حدث خطأ أثناء حذف الاختبارات");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteTests(false);
    }
  };

  const handleClose = () => {
    setSelectedStudents(new Set());
    setSelectedTests(new Set());
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>العمليات المجمّعة</DialogTitle>
            <DialogDescription>
              حدد عناصر متعددة لتنفيذ عمليات جماعية.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                الطلاب ({selectedStudents.size})
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                الاختبارات ({selectedTests.size})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-4">
              {students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا يوجد طلاب.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all-students"
                        checked={selectedStudents.size === students.length}
                        onCheckedChange={selectAllStudents}
                      />
                      <Label htmlFor="select-all-students" className="cursor-pointer">
                        تحديد الكل
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedStudents.size} محدد
                    </span>
                  </div>

                  <ScrollArea className="h-[250px] border rounded-lg p-2">
                    <div className="space-y-2">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded"
                        >
                          <Checkbox
                            id={`student-${student.id}`}
                            checked={selectedStudents.has(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                          <Label
                            htmlFor={`student-${student.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            {student.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={selectedStudents.size === 0 || isDeleting}
                    onClick={() => setConfirmDeleteStudents(true)}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 ml-2" />
                    )}
                    حذف المحدد ({selectedStudents.size})
                  </Button>
                </>
              )}
            </TabsContent>

            <TabsContent value="tests" className="space-y-4">
              {tests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد اختبارات.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all-tests"
                        checked={selectedTests.size === tests.length}
                        onCheckedChange={selectAllTests}
                      />
                      <Label htmlFor="select-all-tests" className="cursor-pointer">
                        تحديد الكل
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedTests.size} محدد
                    </span>
                  </div>

                  <ScrollArea className="h-[250px] border rounded-lg p-2">
                    <div className="space-y-2">
                      {tests.map((test) => (
                        <div
                          key={test.id}
                          className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded"
                        >
                          <Checkbox
                            id={`test-${test.id}`}
                            checked={selectedTests.has(test.id)}
                            onCheckedChange={() => toggleTest(test.id)}
                          />
                          <Label
                            htmlFor={`test-${test.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <span>{test.name}</span>
                            <span className="text-sm text-muted-foreground mr-2">
                              (الدرجة القصوى: {test.maxGrade})
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={selectedTests.size === 0 || isDeleting}
                    onClick={() => setConfirmDeleteTests(true)}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 ml-2" />
                    )}
                    حذف المحدد ({selectedTests.size})
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Students */}
      <AlertDialog open={confirmDeleteStudents} onOpenChange={setConfirmDeleteStudents}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف {selectedStudents.size} طالب وجميع درجاتهم بشكل نهائي.
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudents}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete Tests */}
      <AlertDialog open={confirmDeleteTests} onOpenChange={setConfirmDeleteTests}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف {selectedTests.size} اختبار وجميع الدرجات المرتبطة بها بشكل نهائي.
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTests}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BatchOperations;
