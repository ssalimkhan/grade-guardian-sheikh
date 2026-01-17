import React, { useState, useEffect } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Plus, Trash2, Save, FileDown, Loader2 } from "lucide-react";
import { GradeTemplate, TestConfig } from "@/types";
import { useStore } from "@/store/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GradeTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const GradeTemplates: React.FC<GradeTemplatesProps> = ({
  open,
  onOpenChange,
  userId,
}) => {
  const { tests, addTest } = useStore();
  const [templates, setTemplates] = useState<GradeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");

  // Fetch templates on open
  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, userId]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const result = await supabase
        .from("grade_templates" as any)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }) as unknown as { data: any[]; error: any };

      if (result.error) throw result.error;
      
      // Parse and validate test_configs
      const data = result.data || [];
      const parsedTemplates = (data || []).map((template: any) => ({
        ...template,
        test_configs: Array.isArray(template.test_configs) 
          ? template.test_configs 
          : JSON.parse(template.test_configs || '[]'),
      }));
      
      setTemplates(parsedTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("حدث خطأ أثناء تحميل القوالب");
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentAsTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error("يرجى إدخال اسم للقالب");
      return;
    }

    if (tests.length === 0) {
      toast.error("لا توجد اختبارات لحفظها كقالب");
      return;
    }

    setIsLoading(true);
    try {
      const testConfigs: TestConfig[] = tests.map((test) => ({
        name: test.name,
        maxGrade: test.maxGrade,
      }));

      const result = await supabase
        .from("grade_templates" as any)
        .insert({
          user_id: userId,
          name: newTemplateName.trim(),
          description: newTemplateDescription.trim() || null,
          test_configs: testConfigs,
        })
        .select()
        .single() as unknown as { data: any; error: any };

      if (result.error) throw result.error;
      const data = result.data;

      const newTemplate: GradeTemplate = {
        ...data,
        test_configs: testConfigs,
      };

      setTemplates([newTemplate, ...templates]);
      setSaveDialogOpen(false);
      setNewTemplateName("");
      setNewTemplateDescription("");
      toast.success("تم حفظ القالب بنجاح");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("حدث خطأ أثناء حفظ القالب");
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = async (template: GradeTemplate) => {
    setIsLoading(true);
    try {
      for (const config of template.test_configs) {
        await addTest(config.name, config.maxGrade, userId);
      }
      toast.success(`تم تطبيق قالب "${template.name}" بنجاح`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("حدث خطأ أثناء تطبيق القالب");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async () => {
    if (!deleteTemplateId) return;

    setIsLoading(true);
    try {
      const result = await supabase
        .from("grade_templates" as any)
        .delete()
        .eq("id", deleteTemplateId) as unknown as { error: any };

      const { error } = result;

      if (error) throw error;

      setTemplates(templates.filter((t) => t.id !== deleteTemplateId));
      setDeleteTemplateId(null);
      toast.success("تم حذف القالب بنجاح");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("حدث خطأ أثناء حذف القالب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>قوالب الدرجات</DialogTitle>
            <DialogDescription>
              احفظ وأعد استخدام مخططات الدرجات لأنواع مختلفة من الاختبارات.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Save Current Setup */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSaveDialogOpen(true)}
              disabled={tests.length === 0}
            >
              <Save className="h-4 w-4 ml-2" />
              حفظ الإعداد الحالي كقالب
            </Button>

            {/* Templates List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد قوالب محفوظة بعد.
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {template.name}
                          </CardTitle>
                          {template.description && (
                            <CardDescription className="mt-1">
                              {template.description}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTemplateId(template.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {template.test_configs.map((config, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary px-2 py-1 rounded"
                          >
                            {config.name} ({config.maxGrade})
                          </span>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applyTemplate(template)}
                        disabled={isLoading}
                      >
                        <FileDown className="h-4 w-4 ml-2" />
                        تطبيق القالب
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>حفظ قالب جديد</DialogTitle>
            <DialogDescription>
              سيتم حفظ الاختبارات الحالية ({tests.length} اختبار) كقالب.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اسم القالب</Label>
              <Input
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="مثال: اختبارات الفصل الأول"
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف (اختياري)</Label>
              <Textarea
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                placeholder="وصف مختصر للقالب"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={saveCurrentAsTemplate} disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTemplateId}
        onOpenChange={() => setDeleteTemplateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا القالب بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GradeTemplates;
