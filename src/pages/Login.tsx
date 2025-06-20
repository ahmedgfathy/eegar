import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

export const Login: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون على الأقل 6 أحرف');
      setLoading(false);
      return;
    }

    try {
      const success = await login(mobile, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('رقم الهاتف أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="large" className="justify-center" />
          <p className="text-gray-600 mt-4">تسجيل الدخول إلى حسابك</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Mobile Number Input */}
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

            {/* Password Input */}
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
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 اي ايجار - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};
