import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const emailSchema = z.string().email({ message: 'Invalid email address' });
const passwordSchema = z.string().min(6, { message: 'Password must be at least 6 characters' });

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Sign in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInErrors, setSignInErrors] = useState({ email: '', password: '' });
  
  // Sign up form state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signUpErrors, setSignUpErrors] = useState({ email: '', password: '', fullName: '' });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInErrors({ email: '', password: '' });
    
    // Validate inputs
    const emailResult = emailSchema.safeParse(signInEmail);
    const passwordResult = passwordSchema.safeParse(signInPassword);
    
    if (!emailResult.success || !passwordResult.success) {
      setSignInErrors({
        email: emailResult.success ? '' : emailResult.error.errors[0].message,
        password: passwordResult.success ? '' : passwordResult.error.errors[0].message,
      });
      return;
    }
    
    setLoading(true);
    await signIn(signInEmail, signInPassword);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpErrors({ email: '', password: '', fullName: '' });
    
    // Validate inputs
    const emailResult = emailSchema.safeParse(signUpEmail);
    const passwordResult = passwordSchema.safeParse(signUpPassword);
    
    if (!emailResult.success || !passwordResult.success) {
      setSignUpErrors({
        email: emailResult.success ? '' : emailResult.error.errors[0].message,
        password: passwordResult.success ? '' : passwordResult.error.errors[0].message,
        fullName: '',
      });
      return;
    }
    
    setLoading(true);
    await signUp(signUpEmail, signUpPassword, fullName);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Kerala Lottery Predictor</CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to access AI predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                  {signInErrors.email && (
                    <p className="text-sm text-destructive">{signInErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                  {signInErrors.password && (
                    <p className="text-sm text-destructive">{signInErrors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                  />
                  {signUpErrors.email && (
                    <p className="text-sm text-destructive">{signUpErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                  />
                  {signUpErrors.password && (
                    <p className="text-sm text-destructive">{signUpErrors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
