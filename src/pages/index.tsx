import { Button } from '../components/ui/Button';
import { useUser } from '../hooks/useUser';

export default function Home() {
  const { user, loading, signIn, signOut } = useUser();

  return (
    <main>
      <h1>Linksy</h1>
      <p>Welcome. Next.js + Supabase app is bootstrapped.</p>
      
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div>
          <p>Signed in as: {user.email}</p>
          <Button onClick={signOut}>Sign Out</Button>
        </div>
      ) : (
        <Button onClick={signIn}>Sign In with Google</Button>
      )}
      
      <Button onClick={() => alert('Button works!')}>Test Button</Button>
    </main>
  );
}


