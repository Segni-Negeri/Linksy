import { useUser } from '../hooks/useUser';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

export function AuthForm() {
  const { user, loading, signIn, signOut } = useUser();

  if (loading) return <p>Loading...</p>;

  const handleSignIn = async () => {
    try {
      await signIn();
      toast.success('Welcome to Linksy!');
    } catch (error) {
      toast.error('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out. Please try again.');
    }
  };

  if (user) {
    return (
      <div>
        <p>Signed in as: {user.email}</p>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    );
  }

  return <Button onClick={handleSignIn}>Sign In with Google</Button>;
}



