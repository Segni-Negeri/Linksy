import { Button } from '../components/ui/Button';
import { AuthForm } from '../components/AuthForm';

export default function Home() {
  return (
    <main>
      <h1>Linksy</h1>
      <p>Welcome. Next.js + Supabase app is bootstrapped.</p>
      <AuthForm />
      
      <Button onClick={() => alert('Button works!')}>Test Button</Button>
    </main>
  );
}


