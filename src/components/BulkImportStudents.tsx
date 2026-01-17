import React, { useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useStore } from "@/store/store";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkImportStudentsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const BulkImportStudents: React.FC<BulkImportStudentsProps> = ({
  open,
  onOpenChange,
  userId,
}) => {
  const { addStudent } = useStore();
  const [textInput, setTextInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseStudentNames = (text: string): string[] => {
    // Split by newline, comma, or semicolon and filter empty entries
    return text
      .split(/[\n,;]+/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Handle CSV: extract first column (names)
      if (file.name.endsWith('.csv')) {
        const lines = content.split('\n');
        const names = lines
          .map((line) => {
            const columns = line.split(',');
            return columns[0]?.trim().replace(/^"|"$/g, ''); // Remove quotes
          })
          .filter((name) => name && name.length > 0 && name.toLowerCase() !== 'name');
        setTextInput(names.join('\n'));
      } else {
        setTextInput(content);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const names = parseStudentNames(textInput);
    
    if (names.length === 0) {
      toast.error("لا توجد أسماء صالحة للاستيراد");
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const name of names) {
      try {
        const result = await addStudent(name, userId);
        if (result) {
          success++;
        } else {
          failed++;
          errors.push(`فشل إضافة: ${name}`);
        }
      } catch (error) {
        failed++;
        errors.push(`خطأ في: ${name}`);
      }
    }

    setImportResults({ success, failed, errors });
    setIsImporting(false);

    if (success > 0) {
      toast.success(`تم إضافة ${success} طالب بنجاح`);
    }
    if (failed > 0) {
      toast.error(`فشل إضافة ${failed} طالب`);
    }
  };

  const handleClose = () => {
    setTextInput("");
    setImportResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>استيراد طلاب متعددين</DialogTitle>
          <DialogDescription>
            قم برفع ملف CSV أو إدخال أسماء الطلاب مفصولة بأسطر جديدة أو فواصل.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>رفع ملف</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 ml-2" />
                رفع ملف CSV أو TXT
              </Button>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <Label>أو أدخل الأسماء يدوياً</Label>
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="أدخل اسم كل طالب في سطر منفصل&#10;أحمد محمد&#10;سارة علي&#10;محمد خالد"
              rows={8}
              dir="rtl"
            />
            <p className="text-xs text-muted-foreground">
              يمكن فصل الأسماء بأسطر جديدة أو فواصل
            </p>
          </div>

          {/* Preview Count */}
          {textInput && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>
                {parseStudentNames(textInput).length} اسم جاهز للاستيراد
              </span>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <div className="space-y-2">
              {importResults.success > 0 && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">
                    تم إضافة {importResults.success} طالب بنجاح
                  </AlertDescription>
                </Alert>
              )}
              {importResults.failed > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    فشل إضافة {importResults.failed} طالب
                    {importResults.errors.length > 0 && (
                      <ul className="mt-1 text-xs">
                        {importResults.errors.slice(0, 3).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                        {importResults.errors.length > 3 && (
                          <li>...و {importResults.errors.length - 3} آخرين</li>
                        )}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            إغلاق
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting || parseStudentNames(textInput).length === 0}
          >
            {isImporting ? "جاري الاستيراد..." : "استيراد"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportStudents;
