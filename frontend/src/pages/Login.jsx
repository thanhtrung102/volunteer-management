// ==================== frontend/src/pages/Login.jsx ====================
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 p-4">
      <LoginForm />
    </div>
  );
};

export default Login;