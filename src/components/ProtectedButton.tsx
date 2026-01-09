import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';

interface ProtectedButtonProps {
  children: ReactNode;
  to: string;
  className?: string;
  onClick?: () => void;
}

const ProtectedButton = ({ children, to, className, onClick }: ProtectedButtonProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (user) {
      onClick?.();
      navigate(to);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children}
      </button>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default ProtectedButton;
