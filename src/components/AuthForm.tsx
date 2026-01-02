
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthForm = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('AuthForm: Setting up auth state listener');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthForm: Auth state changed:', event, session);
      setSession(session);
      setLoading(false);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('AuthForm: User signed in successfully');
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في نظام إدارة الدرجات",
          duration: 3000,
        });
        setTimeout(() => navigate('/'), 100);
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('AuthForm: User signed out');
        toast({
          title: "تم تسجيل الخروج",
          description: "نراك قريباً",
          duration: 3000,
        });
      }
      
      if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "تم إرسال رابط استعادة كلمة المرور",
          description: "تحقق من بريدك الإلكتروني",
          duration: 5000,
        });
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('AuthForm: Token refreshed successfully');
      }
    });

    // Then check for existing session
    const checkSession = async () => {
      try {
        console.log('AuthForm: Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthForm: Error getting session:', error);
          toast({
            title: "خطأ في الجلسة",
            description: "حدث خطأ أثناء التحقق من الجلسة",
            variant: "destructive",
            duration: 5000,
          });
        } else {
          console.log('AuthForm: Current session:', session);
          setSession(session);
          if (session) {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('AuthForm: Unexpected error:', error);
        toast({
          title: "خطأ غير متوقع",
          description: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      console.log('AuthForm: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 islamic-pattern">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
          <p className="text-lg font-medium text-foreground">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 islamic-pattern">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="islamic-card rounded-2xl shadow-xl overflow-hidden">
          {/* Decorative Header */}
          <div className="bg-gradient-to-r from-emerald to-emerald-light p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 islamic-pattern"></div>
            <h1 className="text-2xl font-bold text-primary-foreground relative z-10 font-scheherazade">حارس الدرجات</h1>
            <p className="text-primary-foreground/80 mt-1 relative z-10">إدارة درجات الطلاب بكل سهولة</p>
          </div>
          
          {/* Gold decorative line */}
          <div className="gold-line"></div>
          
          <div className="p-6 sm:p-8 bg-card">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground font-scheherazade">
                {window.location.pathname.includes('sign-up') ? 'إنشاء حساب جديد' : 'مرحباً بعودتك'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {window.location.pathname.includes('sign-up') 
                  ? 'املأ البيانات لإنشاء حساب جديد' 
                  : 'سجل دخولك للمتابعة'}
              </p>
            </div>
            
            {authLoading && (
              <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center space-x-3 space-x-reverse">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-primary">جاري المعالجة...</span>
              </div>
            )}
            
            <div className="space-y-6">
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: 'hsl(158, 64%, 32%)',
                        brandAccent: 'hsl(158, 50%, 45%)',
                        brandButtonText: 'white',
                        inputBackground: 'hsl(39, 40%, 98%)',
                        inputBorder: 'hsl(35, 25%, 85%)',
                        inputBorderFocus: 'hsl(158, 64%, 32%)',
                        inputBorderHover: 'hsl(45, 90%, 48%)',
                      },
                      space: {
                        spaceSmall: '0.5rem',
                        spaceMedium: '1rem',
                        spaceLarge: '1.5rem',
                      },
                      fontSizes: {
                        baseBodySize: '0.95rem',
                      },
                      fonts: {
                        bodyFontFamily: 'Amiri, serif',
                        inputFontFamily: 'Amiri, serif',
                      },
                    },
                  },
                  className: {
                    button: 'w-full flex justify-center transition-all duration-200 btn-glow',
                    input: 'rounded-lg border-border focus:border-primary focus:ring-primary transition-all duration-200 bg-input',
                    label: 'text-sm font-medium text-foreground',
                    anchor: 'text-primary hover:text-emerald-light text-sm transition-colors duration-200',
                    message: 'text-sm',
                  },
                }}
                providers={[]}
                view={window.location.pathname.includes('sign-up') ? 'sign_up' : 'sign_in'}
                showLinks={true}
                magicLink={true}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: 'البريد الإلكتروني',
                      password_label: 'كلمة المرور',
                      button_label: 'تسجيل الدخول',
                      link_text: 'لديك حساب بالفعل؟ سجل دخول',
                      loading_button_label: 'جاري تسجيل الدخول...',
                      email_input_placeholder: 'أدخل بريدك الإلكتروني',
                      password_input_placeholder: 'أدخل كلمة المرور',
                    },
                    sign_up: {
                      email_label: 'البريد الإلكتروني',
                      password_label: 'كلمة المرور',
                      button_label: 'إنشاء حساب',
                      link_text: 'ليس لديك حساب؟ سجل الآن',
                      loading_button_label: 'جاري إنشاء الحساب...',
                      email_input_placeholder: 'أدخل بريدك الإلكتروني',
                      password_input_placeholder: 'أدخل كلمة المرور (8 أحرف على الأقل)',
                    },
                    forgotten_password: {
                      email_label: 'البريد الإلكتروني',
                      button_label: 'إرسال رابط الاستعادة',
                      loading_button_label: 'جاري الإرسال...',
                      link_text: 'نسيت كلمة المرور؟',
                      confirmation_text: 'تحقق من بريدك الإلكتروني للحصول على رابط استعادة كلمة المرور',
                    },
                  },
                }}
                redirectTo={window.location.origin}
                onlyThirdPartyProviders={false}
              />
              
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full gold-line" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">أو</span>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-center text-sm text-muted-foreground">
                  {window.location.pathname.includes('sign-up') ? (
                    <>لديك حساب بالفعل؟{' '}
                      <a 
                        href="/login" 
                        className="font-medium text-primary hover:text-emerald-light transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/login');
                        }}
                      >
                        سجل دخول
                      </a>
                    </>
                  ) : (
                    <>ليس لديك حساب؟{' '}
                      <a 
                        href="/signup" 
                        className="font-medium text-primary hover:text-emerald-light transition-colors duration-200"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/signup');
                        }}
                      >
                        سجل الآن
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with decorative elements */}
        <div className="mt-6 text-center">
          <div className="gold-line mb-4 w-1/2 mx-auto"></div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} حارس الدرجات. جميع الحقوق محفوظة.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;
