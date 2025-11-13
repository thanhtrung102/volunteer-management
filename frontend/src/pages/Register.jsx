// ==================== frontend/src/pages/Register.jsx ====================
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 p-4">
      <RegisterForm />
    </div>
  );
};

export default Register;