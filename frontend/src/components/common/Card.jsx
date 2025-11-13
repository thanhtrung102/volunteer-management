// ============= src/components/common/Card.jsx =============
export const Card = ({ children, className = '', padding = true, hover = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow ${padding ? 'p-6' : ''} ${hover ? 'hover:shadow-lg transition-shadow' : ''} ${className}`}>
      {children}
    </div>
  );
};