import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

interface RegisterStep {
  step: 'mobile' | 'verification' | 'password';
}

export const Register: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RegisterStep['step']>('mobile');
  const [mobile, setMobile] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { register, verifyCode, completeRegistration } = useAuth();
  const navigate = useNavigate();

  // Start countdown for resend verification
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate mobile number (Egyptian format)
    const mobileRegex = /^(01)[0-9]{9}$/;
    if (!mobileRegex.test(mobile)) {
      setError('يرجى إدخال رقم هاتف صحيح (يجب أن يبدأ بـ 01 ويتكون من 11 رقماً)');
      setLoading(false);
      return;
    }

    try {
      const success = await register(mobile, password);
      if (success) {
        setCurrentStep('verification');
        startCountdown();
      } else {
        setError('فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى');
      }
    } catch (error) {
      setError('حدث خطأ أثناء إرسال رمز التحقق');
    }
    
    setLoading(false);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (verificationCode.length !== 6) {
      setError('رمز التحقق يجب أن يكون 6 أرقام');
      setLoading(false);
      return;
    }

    try {
      const success = await verifyCode(mobile, verificationCode);
      if (success) {
        setCurrentStep('password');
      } else {
        setError('رمز التحقق غير صحيح');
      }
    } catch (error) {
      setError('حدث خطأ أثناء التحقق من الرمز');
    }
    
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون على الأقل 6 أحرف');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقتان');
      setLoading(false);
      return;
    }

    try {
      const success = await completeRegistration(mobile, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (error) {
      setError('حدث خطأ أثناء إنشاء الحساب');
    }
    
    setLoading(false);
  };

  const resendVerificationCode = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      // Simulate resending SMS
      console.log(`Resending verification code to ${mobile}`);
      startCountdown();
    } catch (error) {
      setError('فشل في إعادة إرسال رمز التحقق');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="large" className="justify-center" />
          <p className="text-gray-600 mt-4">إنشاء حساب جديد</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep === 'mobile' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 mx-2 ${
            currentStep === 'mobile' ? 'bg-gray-300' : 'bg-green-500'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep === 'verification' ? 'bg-blue-600 text-white' : 
            currentStep === 'password' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 mx-2 ${
            currentStep === 'password' ? 'bg-green-500' : 'bg-gray-300'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep === 'password' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            3
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Mobile Number */}
          {currentStep === 'mobile' && (
            <form onSubmit={handleMobileSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">أدخل رقم هاتفك</h2>
                <p className="text-gray-600 text-sm">سنرسل لك رمز التحقق عبر الرسائل القصيرة</p>
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Smartphone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="01xxxxxxxxx"
                    maxLength={11}
                    dir="ltr"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">مثال: 01012345678</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {currentStep === 'verification' && (
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">أدخل رمز التحقق</h2>
                <p className="text-gray-600 text-sm">
                  تم إرسال رمز التحقق إلى {mobile}
                </p>
              </div>

              <div>
                <label htmlFor="verification" className="block text-sm font-medium text-gray-700 mb-2">
                  رمز التحقق
                </label>
                <input
                  id="verification"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  dir="ltr"
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-center">أدخل الرمز المكون من 6 أرقام</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري التحقق...' : 'تحقق من الرمز'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resendVerificationCode}
                  disabled={countdown > 0 || loading}
                  className="text-blue-600 hover:text-blue-700 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `إعادة الإرسال خلال ${countdown} ثانية` : 'إعادة إرسال الرمز'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep('mobile')}
                className="w-full text-gray-600 hover:text-gray-800 py-2 flex items-center justify-center"
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                تغيير رقم الهاتف
              </button>
            </form>
          )}

          {/* Step 3: Password */}
          {currentStep === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">إنشاء كلمة مرور</h2>
                <p className="text-gray-600 text-sm">اختر كلمة مرور قوية لحسابك</p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">يجب أن تكون كلمة المرور على الأقل 6 أحرف</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-10 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('verification')}
                className="w-full text-gray-600 hover:text-gray-800 py-2 flex items-center justify-center"
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للتحقق
              </button>
            </form>
          )}
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              تسجيل الدخول
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 اي ايجار - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};
