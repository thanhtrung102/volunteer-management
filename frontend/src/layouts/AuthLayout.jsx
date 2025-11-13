// ============= src/layouts/AuthLayout.jsx =============
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {children}
    </div>
  );
};

export default AuthLayout;