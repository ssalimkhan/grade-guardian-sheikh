import { supabase } from "@/integrations/supabase/client";

// Helper functions to avoid TypeScript deep instantiation errors with Supabase
// These functions cast the result to avoid the "Type instantiation is excessively deep" error

export async function fetchFromTable(
  tableName: string,
  userId: string,
  orderBy: string = "created_at"
): Promise<{ data: any[]; error: any }> {
  const query = supabase
    .from(tableName as any)
    .select("*")
    .eq("user_id", userId)
    .order(orderBy, { ascending: true });
  
  return query as unknown as Promise<{ data: any[]; error: any }>;
}

export async function fetchByIds(
  tableName: string,
  column: string,
  ids: string[]
): Promise<{ data: any[]; error: any }> {
  const query = supabase
    .from(tableName as any)
    .select("*")
    .in(column, ids);
  
  return query as unknown as Promise<{ data: any[]; error: any }>;
}

export async function insertRow(
  tableName: string,
  data: Record<string, any>
): Promise<{ data: any; error: any }> {
  const query = supabase
    .from(tableName as any)
    .insert(data)
    .select()
    .single();
  
  return query as unknown as Promise<{ data: any; error: any }>;
}

export async function updateRow(
  tableName: string,
  id: string,
  data: Record<string, any>
): Promise<{ error: any }> {
  const query = supabase
    .from(tableName as any)
    .update(data)
    .eq("id", id);
  
  return query as unknown as Promise<{ error: any }>;
}

export async function deleteRow(
  tableName: string,
  column: string,
  value: string
): Promise<{ error: any }> {
  const query = supabase
    .from(tableName as any)
    .delete()
    .eq(column, value);
  
  return query as unknown as Promise<{ error: any }>;
}

export async function upsertGrade(
  existingId: string | null,
  studentId: string,
  testId: string,
  value: number
): Promise<{ data: any; error: any }> {
  if (existingId) {
    const query = supabase
      .from("grades" as any)
      .update({ value })
      .eq("id", existingId)
      .select()
      .single();
    return query as unknown as Promise<{ data: any; error: any }>;
  } else {
    const query = supabase
      .from("grades" as any)
      .insert({
        studentid: studentId,
        testid: testId,
        value,
      })
      .select()
      .single();
    return query as unknown as Promise<{ data: any; error: any }>;
  }
}
