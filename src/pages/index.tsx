import { Button } from '../components/ui/Button';

export default function Home() {
  return (
    <main>
      <h1>Linksy</h1>
      <p>Welcome. Next.js + Supabase app is bootstrapped.</p>
      <Button onClick={() => alert('Button works!')}>Test Button</Button>
    </main>
  );
}


