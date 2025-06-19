import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { interactionLogger } from "@/lib/interaction-logger";

export default function FakeLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    interactionLogger.logLoginAttempt({ email, password, rememberMe });
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      alert('Login failed. Please check your credentials.');
      interactionLogger.logInteraction('login_failed', { reason: 'fake_credentials' });
    }, 2000);
  };

  const handleEmailFocus = () => {
    interactionLogger.logFormFocus('email');
  };

  const handlePasswordFocus = () => {
    interactionLogger.logFormFocus('password');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    interactionLogger.logFormInput('email', e.target.value.length);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    interactionLogger.logFormInput('password', e.target.value.length);
  };

  const handleLinkClick = (text: string, href?: string) => {
    interactionLogger.logNavigationClick('a', text, href);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Sign in to your account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            value={email}
            onChange={handleEmailChange}
            onFocus={handleEmailFocus}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </Label>
          <Input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={handlePasswordChange}
            onFocus={handlePasswordFocus}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="remember-me" className="text-sm text-gray-900">
              Remember me
            </Label>
          </div>
          <a 
            href="#" 
            className="text-sm text-walmart-blue hover:underline"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('Forgot password?', '#');
            }}
          >
            Forgot password?
          </a>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white walmart-blue hover:walmart-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a 
          href="#" 
          className="font-medium text-walmart-blue hover:underline"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('Sign up here', '#');
          }}
        >
          Sign up here
        </a>
      </p>
    </div>
  );
}
