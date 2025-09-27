import { useUser } from '../hooks/useUser';
import { Button } from './ui/Button';

export function AuthForm() {
  const { user, loading, signIn, signOut } = useUser();

  if (loading) return <p>Loading...</p>;

  if (user) {
    return (
      <div>
        <p>Signed in as: {user.email}</p>
        <Button onClick={signOut}>Sign Out</Button>
      </div>
    );
  }

  return <Button onClick={signIn}>Sign In with Google</Button>;
}



