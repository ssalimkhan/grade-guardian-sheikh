import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Keyboard, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Check } from "lucide-react";
import { useStore } from "@/store/store";
import { toast } from "sonner";

interface QuickGradeEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickGradeEntry: React.FC<QuickGradeEntryProps> = ({
  open,
  onOpenChange,
}) => {
  const { students, tests, grades, updateGrade } = useStore();
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [savedGrades, setSavedGrades] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize grade inputs when test changes
  useEffect(() => {
    if (selectedTestId && students.length > 0) {
      const inputs: Record<string, string> = {};
      students.forEach((student) => {
        const existingGrade = grades.find(
          (g) => g.studentId === student.id && g.testId === selectedTestId
        );
        inputs[student.id] = existingGrade ? String(existingGrade.value) : "";
      });
      setGradeInputs(inputs);
      setCurrentStudentIndex(0);
      setSavedGrades(new Set());
    }
  }, [selectedTestId, students, grades]);

  // Focus input when current student changes
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [currentStudentIndex, open]);

  const currentStudent = students[currentStudentIndex];
  const currentTest = tests.find((t) => t.id === selectedTestId);

  const handleGradeChange = (value: string) => {
    if (!currentStudent) return;
    
    // Allow empty string or valid numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setGradeInputs((prev) => ({
        ...prev,
        [currentStudent.id]: value,
      }));
    }
  };

  const saveCurrentGrade = useCallback(async () => {
    if (!currentStudent || !currentTest) return;

    const gradeValue = gradeInputs[currentStudent.id];
    if (gradeValue === "" || gradeValue === undefined) return;

    const numValue = parseFloat(gradeValue);
    if (isNaN(numValue)) return;

    // Validate range
    if (numValue < 0 || numValue > currentTest.maxGrade) {
      toast.error(`الدرجة يجب أن تكون بين 0 و ${currentTest.maxGrade}`);
      return;
    }

    await updateGrade(currentStudent.id, selectedTestId, numValue);
    setSavedGrades((prev) => new Set([...prev, currentStudent.id]));
  }, [currentStudent, currentTest, gradeInputs, selectedTestId, updateGrade]);

  const goToNextStudent = useCallback(() => {
    if (currentStudentIndex < students.length - 1) {
      setCurrentStudentIndex((prev) => prev + 1);
    }
  }, [currentStudentIndex, students.length]);

  const goToPreviousStudent = useCallback(() => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex((prev) => prev - 1);
    }
  }, [currentStudentIndex]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
        case "Tab":
          e.preventDefault();
          await saveCurrentGrade();
          goToNextStudent();
          break;
        case "ArrowDown":
          e.preventDefault();
          goToNextStudent();
          break;
        case "ArrowUp":
          e.preventDefault();
          goToPreviousStudent();
          break;
        case "Escape":
          onOpenChange(false);
          break;
      }
    },
    [saveCurrentGrade, goToNextStudent, goToPreviousStudent, onOpenChange]
  );

  const handleClose = () => {
    setSelectedTestId("");
    setCurrentStudentIndex(0);
    setGradeInputs({});
    setSavedGrades(new Set());
    onOpenChange(false);
  };

  const progressPercentage =
    students.length > 0
      ? Math.round((savedGrades.size / students.length) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            إدخال سريع للدرجات
          </DialogTitle>
          <DialogDescription>
            استخدم لوحة المفاتيح للتنقل السريع وإدخال الدرجات.
          </DialogDescription>
        </DialogHeader>

        {/* Test Selection */}
        <div className="space-y-2">
          <Label>اختر الاختبار</Label>
          <Select value={selectedTestId} onValueChange={setSelectedTestId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر اختباراً..." />
            </SelectTrigger>
            <SelectContent>
              {tests.map((test) => (
                <SelectItem key={test.id} value={test.id}>
                  {test.name} (الدرجة القصوى: {test.maxGrade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTestId && students.length > 0 && currentStudent && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم</span>
                <span>
                  {savedGrades.size} / {students.length} ({progressPercentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Current Student */}
            <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  الطالب {currentStudentIndex + 1} من {students.length}
                </span>
                {savedGrades.has(currentStudent.id) && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/50">
                    <Check className="h-3 w-3 ml-1" />
                    تم الحفظ
                  </Badge>
                )}
              </div>
              
              <div className="text-xl font-bold">{currentStudent.name}</div>

              <div className="flex items-center gap-3">
                <Input
                  ref={inputRef}
                  type="number"
                  value={gradeInputs[currentStudent.id] || ""}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  min={0}
                  max={currentTest?.maxGrade || 100}
                  placeholder="أدخل الدرجة..."
                  className="text-lg text-center"
                />
                <span className="text-muted-foreground">
                  / {currentTest?.maxGrade}
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={goToPreviousStudent}
                disabled={currentStudentIndex === 0}
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                السابق
              </Button>
              <Button
                onClick={async () => {
                  await saveCurrentGrade();
                  goToNextStudent();
                }}
                disabled={currentStudentIndex === students.length - 1}
              >
                التالي
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium">اختصارات لوحة المفاتيح:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-background rounded border text-xs">Enter</kbd>
                  <span>حفظ والتالي</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-background rounded border text-xs">↑</kbd>
                  <span>الطالب السابق</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-background rounded border text-xs">Tab</kbd>
                  <span>حفظ والتالي</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-background rounded border text-xs">↓</kbd>
                  <span>الطالب التالي</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTestId && students.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد طلاب. الرجاء إضافة طلاب أولاً.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuickGradeEntry;
