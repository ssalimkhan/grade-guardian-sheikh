import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Zap, 
  Upload, 
  FileText, 
  Keyboard, 
  Layers,
  ChevronDown 
} from "lucide-react";
import BulkImportStudents from "./BulkImportStudents";
import GradeTemplates from "./GradeTemplates";
import QuickGradeEntry from "./QuickGradeEntry";
import BatchOperations from "./BatchOperations";

interface ProductivityToolbarProps {
  userId: string;
}

const ProductivityToolbar: React.FC<ProductivityToolbarProps> = ({ userId }) => {
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [quickGradeOpen, setQuickGradeOpen] = useState(false);
  const [batchOpsOpen, setBatchOpsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">أدوات الإنتاجية</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setBulkImportOpen(true)}>
            <Upload className="h-4 w-4 ml-2" />
            استيراد طلاب متعددين
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTemplatesOpen(true)}>
            <FileText className="h-4 w-4 ml-2" />
            قوالب الدرجات
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setQuickGradeOpen(true)}>
            <Keyboard className="h-4 w-4 ml-2" />
            إدخال سريع للدرجات
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBatchOpsOpen(true)}>
            <Layers className="h-4 w-4 ml-2" />
            العمليات المجمّعة
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <BulkImportStudents
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        userId={userId}
      />
      <GradeTemplates
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        userId={userId}
      />
      <QuickGradeEntry
        open={quickGradeOpen}
        onOpenChange={setQuickGradeOpen}
      />
      <BatchOperations
        open={batchOpsOpen}
        onOpenChange={setBatchOpsOpen}
      />
    </>
  );
};

export default ProductivityToolbar;
