import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, User, BookOpen, BarChart2, Loader2 } from "lucide-react";
import TestManagement from "@/components/TestManagement";
import StudentTable from "@/components/StudentTable";
import StudentForm from "@/components/StudentForm";
import ExportButtons from "@/components/ExportButtons";
import { useStore } from "@/store/store";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StudentPerformanceChart from "@/components/StudentPerformanceChart";

interface IndexProps {
  session: Session;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const Index: React.FC<IndexProps> = ({ session }) => {
  const { fetchAllData, students, tests, grades } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchAllData(session.user.id);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchAllData, session.user.id]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Calculate stats
  const totalStudents = students.length;
  const totalTests = tests.length;
  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length).toFixed(1)
    : 0;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
          <p className="text-lg font-medium text-foreground">جاري تحميل البيانات...</p>
          <p className="text-sm text-muted-foreground">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow islamic-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                className="hidden sm:flex items-center gap-2"
                onClick={() => setStudentFormOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>إضافة طالب</span>
              </Button>
              <ExportButtons />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-foreground hover:bg-secondary"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 ml-1" />
                <span>تسجيل الخروج</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {session.user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-foreground">{session.user.email}</p>
                  <p className="text-xs text-muted-foreground">مدير النظام</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/20 islamic-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary">إجمالي الطلاب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-foreground">{totalStudents}</div>
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-primary">
                  {totalStudents > 0 ? `${totalStudents} طالب` : 'لا يوجد طلاب مسجلين بعد'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm bg-gradient-to-br from-turquoise/10 to-turquoise/20 islamic-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-turquoise">الاختبارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-foreground">{totalTests}</div>
                  <div className="p-3 rounded-full bg-turquoise/20 text-turquoise">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-turquoise">
                  {totalTests > 0 ? `${totalTests} اختبار` : 'لا توجد اختبارات بعد'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm bg-gradient-to-br from-accent/10 to-accent/20 islamic-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-accent">متوسط الدرجات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-foreground">{averageGrade}</div>
                  <div className="p-3 rounded-full bg-accent/20 text-accent-foreground">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-accent">
                  {grades.length > 0 ? 'متوسط درجات الطلاب' : 'لا توجد درجات مسجلة'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="students">الطلاب</TabsTrigger>
              <TabsTrigger value="tests">الاختبارات</TabsTrigger>
              <TabsTrigger value="reports">التقارير</TabsTrigger>
            </TabsList>
            
            <Button 
              variant="default" 
              size="sm"
              className="sm:hidden"
              onClick={() => setStudentFormOpen(true)}
            >
              <Plus className="h-4 w-4 ml-1" />
              <span>إضافة طالب</span>
            </Button>
          </div>

          <TabsContent value="students" className="space-y-6">
            <StudentTable />
          </TabsContent>
          
          <TabsContent value="tests">
            <TestManagement />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التقارير</CardTitle>
                <CardDescription>عرض وتحليل درجات الطلاب</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 || tests.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">لا توجد بيانات كافية لعرض التقارير</h3>
                    <p className="mt-1 text-sm text-muted-foreground">يرجى إضافة طلاب واختبارات أولاً</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-sm font-medium">إجمالي الطلاب</CardDescription>
                          <CardTitle className="text-2xl">{totalStudents}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-sm font-medium">إجمالي الاختبارات</CardDescription>
                          <CardTitle className="text-2xl">{totalTests}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-sm font-medium">متوسط الدرجات</CardDescription>
                          <CardTitle className="text-2xl">{averageGrade}</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">ملخص النتائج</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <StudentPerformanceChart 
                            students={students} 
                            grades={grades} 
                            tests={tests} 
                          />
                        </div>
                        <div className="bg-card rounded-lg border p-4 overflow-auto" style={{ maxHeight: '500px' }}>
                          <h4 className="font-medium mb-3 text-center text-foreground">تفاصيل الدرجات</h4>
                          <div className="space-y-2">
                            {students.map((student) => {
                              const studentGrades = grades.filter(g => g.studentId === student.id);
                              const studentAverage = studentGrades.length > 0
                                ? (studentGrades.reduce((sum, g) => sum + g.value, 0) / studentGrades.length).toFixed(1)
                                : 'N/A';
                              
                              return (
                                <div key={student.id} className="p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-foreground">{student.name}</span>
                                    <div className="flex items-center">
                                      <span className="ml-2 font-bold text-foreground">{studentAverage}%</span>
                                      <div 
                                        className="w-3 h-3 rounded-full ml-2" 
                                        style={{
                                          backgroundColor: COLORS[students.findIndex(s => s.id === student.id) % COLORS.length]
                                        }}
                                      />
                                    </div>
                                  </div>
                                  {studentGrades.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-border text-sm text-muted-foreground">
                                      <div className="grid grid-cols-2 gap-2">
                                        {studentGrades.map(grade => {
                                          const test = tests.find(t => t.id === grade.testId);
                                          return test ? (
                                            <div key={grade.id} className="flex justify-between">
                                              <span className="truncate max-w-[100px]">{test.name}</span>
                                              <span>{grade.value}%</span>
                                            </div>
                                          ) : null;
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Add Student Dialog */}
      <StudentForm 
        open={studentFormOpen} 
        onOpenChange={setStudentFormOpen}
        userId={session.user.id}
        student={undefined}
        studentGrades={{}}
      />
    </div>
  );
};

export default Index;