import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { interactionLogger } from "@/lib/interaction-logger";

interface WalmartSignupProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function WalmartSignup({ onBack, onSuccess }: WalmartSignupProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false,
    emailOffers: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    interactionLogger.logInteraction('signup_attempt', {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      passwordLength: formData.password.length,
      agreeToTerms: formData.agreeToTerms,
      emailOffers: formData.emailOffers
    });
    
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        interactionLogger.logInteraction('signup_failed', { reason: 'password_mismatch' });
        return;
      }
      if (!formData.agreeToTerms) {
        alert('Please agree to Terms & Conditions');
        interactionLogger.logInteraction('signup_failed', { reason: 'terms_not_agreed' });
        return;
      }
      
      alert('Account created successfully! Please check your email for verification.');
      interactionLogger.logInteraction('signup_success', { email: formData.email });
      onSuccess();
    }, 2000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (typeof value === 'string') {
      interactionLogger.logFormInput(field, value.length);
    }
  };

  const handleFocus = (field: string) => {
    interactionLogger.logFormFocus(field);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create your Walmart account</h2>
        <p className="text-gray-600 mt-2">Unlock the best of Walmart.com</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First name *
            </Label>
            <Input
              type="text"
              id="firstName"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onFocus={() => handleFocus('firstName')}
              className="mt-1 w-full"
              placeholder="First name"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last name *
            </Label>
            <Input
              type="text"
              id="lastName"
              required
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              onFocus={() => handleFocus('lastName')}
              className="mt-1 w-full"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address *
          </Label>
          <Input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onFocus={() => handleFocus('email')}
            className="mt-1 w-full"
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Mobile phone number
          </Label>
          <Input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onFocus={() => handleFocus('phone')}
            className="mt-1 w-full"
            placeholder="(000) 000-0000"
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll send order updates and special offers
          </p>
        </div>

        <div>
          <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password *
          </Label>
          <Input
            type="password"
            id="password"
            required
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onFocus={() => handleFocus('password')}
            className="mt-1 w-full"
            placeholder="Create password"
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 8 characters
          </p>
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm password *
          </Label>
          <Input
            type="password"
            id="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            onFocus={() => handleFocus('confirmPassword')}
            className="mt-1 w-full"
            placeholder="Re-enter password"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
            />
            <Label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-tight">
              I agree to Walmart's{' '}
              <a href="#" className="text-walmart-blue hover:underline" onClick={(e) => {
                e.preventDefault();
                interactionLogger.logNavigationClick('a', 'Terms & Conditions', '#terms');
              }}>
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-walmart-blue hover:underline" onClick={(e) => {
                e.preventDefault();
                interactionLogger.logNavigationClick('a', 'Privacy Policy', '#privacy');
              }}>
                Privacy Policy
              </a>
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="emailOffers"
              checked={formData.emailOffers}
              onCheckedChange={(checked) => handleInputChange('emailOffers', checked as boolean)}
            />
            <Label htmlFor="emailOffers" className="text-sm text-gray-700 leading-tight">
              Send me emails about rollbacks, special pricing, and other sweet deals
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full walmart-blue hover:walmart-dark-blue text-white py-3 font-semibold"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-walmart-blue hover:underline text-sm"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By creating an account, you agree to receive recurring automated promotional and personalized marketing text messages from Walmart
        </p>
      </div>
    </div>
  );
}