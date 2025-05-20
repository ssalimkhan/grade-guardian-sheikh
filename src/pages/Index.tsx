
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TestManagement from "@/components/TestManagement";
import StudentTable from "@/components/StudentTable";
import StudentForm from "@/components/StudentForm";
import ExportButtons from "@/components/ExportButtons";
import { useStore } from "@/store/store";

const Index: React.FC = () => {
  const { fetchAllData } = useStore();
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchAllData();
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchAllData]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mt-4 sm:mt-0">سجل درجات الطلاب</h1>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <ExportButtons />
            
            <Button onClick={() => setStudentFormOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة طالب
            </Button>
          </div>
        </div>
        
        <p className="text-gray-600">
          قم بإدارة درجات الطلاب وإضافة الاختبارات بسهولة.
        </p>
      </div>
      
      <TestManagement />
      <StudentTable />
      
      {/* Add Student Dialog */}
      <StudentForm 
        open={studentFormOpen} 
        onOpenChange={setStudentFormOpen}
      />
    </div>
  );
};

export default Index;
