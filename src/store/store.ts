
import { create } from 'zustand';
import { Student, Test, Grade, FormattedStudent } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StoreState {
  students: Student[];
  tests: Test[];
  grades: Grade[];
  isLoading: boolean;
  error: string | null;

  // Fetch data
  fetchStudents: () => Promise<void>;
  fetchTests: () => Promise<void>;
  fetchGrades: () => Promise<void>;
  fetchAllData: () => Promise<void>;

  // Student operations
  addStudent: (name: string) => Promise<Student | null>;
  updateStudent: (id: string, name: string) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  // Test operations
  addTest: (name: string, maxGrade: number) => Promise<Test | null>;
  updateTest: (id: string, name: string, maxGrade: number) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;

  // Grade operations
  updateGrade: (studentId: string, testId: string, value: number) => Promise<void>;
  
  // Helper functions
  getFormattedStudents: () => FormattedStudent[];
  getTotalMaxGrade: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  students: [],
  tests: [],
  grades: [],
  isLoading: false,
  error: null,

  // Fetch data
  fetchStudents: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      set({ students: data || [] });
    } catch (error) {
      console.error('Error fetching students:', error);
      set({ error: 'حدث خطأ أثناء تحميل بيانات الطلاب' });
      toast.error('حدث خطأ أثناء تحميل بيانات الطلاب');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTests: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Map database fields to our model
      const mappedData = data?.map(item => ({
        ...item,
        maxGrade: item.maxgrade // Map maxgrade -> maxGrade
      })) || [];
      
      set({ tests: mappedData });
    } catch (error) {
      console.error('Error fetching tests:', error);
      set({ error: 'حدث خطأ أثناء تحميل بيانات الاختبارات' });
      toast.error('حدث خطأ أثناء تحميل بيانات الاختبارات');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGrades: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('grades')
        .select('*');

      if (error) throw error;
      
      // Map database fields to our model
      const mappedData = data?.map(item => ({
        ...item,
        studentId: item.studentid, // Map studentid -> studentId
        testId: item.testid       // Map testid -> testId
      })) || [];
      
      set({ grades: mappedData });
    } catch (error) {
      console.error('Error fetching grades:', error);
      set({ error: 'حدث خطأ أثناء تحميل بيانات الدرجات' });
      toast.error('حدث خطأ أثناء تحميل بيانات الدرجات');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllData: async () => {
    try {
      set({ isLoading: true });
      await Promise.all([
        get().fetchStudents(),
        get().fetchTests(),
        get().fetchGrades()
      ]);
    } catch (error) {
      console.error('Error fetching all data:', error);
      set({ error: 'حدث خطأ أثناء تحميل البيانات' });
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      set({ isLoading: false });
    }
  },

  // Student operations
  addStudent: async (name: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('students')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        students: [...state.students, data]
      }));
      
      toast.success('تم إضافة الطالب بنجاح');
      return data;
    } catch (error) {
      console.error('Error adding student:', error);
      set({ error: 'حدث خطأ أثناء إضافة الطالب' });
      toast.error('حدث خطأ أثناء إضافة الطالب');
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStudent: async (id: string, name: string) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase
        .from('students')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        students: state.students.map(student => 
          student.id === id ? { ...student, name } : student
        )
      }));
      
      toast.success('تم تحديث بيانات الطالب بنجاح');
    } catch (error) {
      console.error('Error updating student:', error);
      set({ error: 'حدث خطأ أثناء تحديث بيانات الطالب' });
      toast.error('حدث خطأ أثناء تحديث بيانات الطالب');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteStudent: async (id: string) => {
    try {
      set({ isLoading: true });
      
      // First delete related grades
      const { error: gradesError } = await supabase
        .from('grades')
        .delete()
        .eq('studentid', id);

      if (gradesError) throw gradesError;
      
      // Then delete the student
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        students: state.students.filter(student => student.id !== id),
        grades: state.grades.filter(grade => grade.studentId !== id)
      }));
      
      toast.success('تم حذف الطالب بنجاح');
    } catch (error) {
      console.error('Error deleting student:', error);
      set({ error: 'حدث خطأ أثناء حذف الطالب' });
      toast.error('حدث خطأ أثناء حذف الطالب');
    } finally {
      set({ isLoading: false });
    }
  },

  // Test operations
  addTest: async (name: string, maxGrade: number) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('tests')
        .insert({ name, maxgrade: maxGrade }) // Use maxgrade (lowercase) to match DB column name
        .select()
        .single();

      if (error) throw error;
      
      // Convert database fields to our model format
      const newTest = {
        ...data,
        maxGrade: data.maxgrade // Map maxgrade -> maxGrade
      };
      
      set((state) => ({
        tests: [...state.tests, newTest]
      }));
      
      toast.success('تم إضافة الاختبار بنجاح');
      return newTest;
    } catch (error) {
      console.error('Error adding test:', error);
      set({ error: 'حدث خطأ أثناء إضافة الاختبار' });
      toast.error('حدث خطأ أثناء إضافة الاختبار');
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTest: async (id: string, name: string, maxGrade: number) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase
        .from('tests')
        .update({ name, maxgrade: maxGrade }) // Use maxgrade (lowercase) to match DB column name
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        tests: state.tests.map(test => 
          test.id === id ? { ...test, name, maxGrade } : test
        )
      }));
      
      toast.success('تم تحديث بيانات الاختبار بنجاح');
    } catch (error) {
      console.error('Error updating test:', error);
      set({ error: 'حدث خطأ أثناء تحديث بيانات الاختبار' });
      toast.error('حدث خطأ أثناء تحديث بيانات الاختبار');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTest: async (id: string) => {
    try {
      set({ isLoading: true });
      
      // First delete related grades
      const { error: gradesError } = await supabase
        .from('grades')
        .delete()
        .eq('testid', id);

      if (gradesError) throw gradesError;
      
      // Then delete the test
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        tests: state.tests.filter(test => test.id !== id),
        grades: state.grades.filter(grade => grade.testId !== id)
      }));
      
      toast.success('تم حذف الاختبار بنجاح');
    } catch (error) {
      console.error('Error deleting test:', error);
      set({ error: 'حدث خطأ أثناء حذف الاختبار' });
      toast.error('حدث خطأ أثناء حذف الاختبار');
    } finally {
      set({ isLoading: false });
    }
  },

  // Grade operations
  updateGrade: async (studentId: string, testId: string, value: number) => {
    try {
      set({ isLoading: true });
      
      // Check if a grade record already exists
      const existingGrade = get().grades.find(
        g => g.studentId === studentId && g.testId === testId
      );
      
      if (existingGrade) {
        // Update existing grade
        const { error } = await supabase
          .from('grades')
          .update({ value })
          .eq('id', existingGrade.id);

        if (error) throw error;
        
        set((state) => ({
          grades: state.grades.map(grade => 
            grade.id === existingGrade.id ? { ...grade, value } : grade
          )
        }));
      } else {
        // Create new grade
        const { data, error } = await supabase
          .from('grades')
          .insert({ 
            studentid: studentId, // Use studentid (lowercase) to match DB column name
            testid: testId,      // Use testid (lowercase) to match DB column name
            value 
          })
          .select()
          .single();

        if (error) throw error;
        
        // Convert from DB format to our model format
        const newGrade = {
          ...data,
          studentId: data.studentid,
          testId: data.testid
        };
        
        set((state) => ({
          grades: [...state.grades, newGrade]
        }));
      }
      
      toast.success('تم حفظ الدرجة بنجاح');
    } catch (error) {
      console.error('Error updating grade:', error);
      set({ error: 'حدث خطأ أثناء حفظ الدرجة' });
      toast.error('حدث خطأ أثناء حفظ الدرجة');
    } finally {
      set({ isLoading: false });
    }
  },

  // Helper functions
  getFormattedStudents: () => {
    const { students, tests, grades } = get();
    
    return students.map(student => {
      // Create a map of testId -> grade for this student
      const studentGrades: Record<string, number | null> = {};
      let total = 0;
      let maxPossible = 0;
      
      tests.forEach(test => {
        const grade = grades.find(g => g.studentId === student.id && g.testId === test.id);
        studentGrades[test.id] = grade ? grade.value : null;
        
        if (grade) {
          total += grade.value;
          maxPossible += test.maxGrade;
        }
      });
      
      return {
        id: student.id,
        name: student.name,
        grades: studentGrades,
        total,
        maxPossible
      };
    });
  },
  
  getTotalMaxGrade: () => {
    return get().tests.reduce((sum, test) => sum + test.maxGrade, 0);
  }
}));
