import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md p-4 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-xl shadow-primary/30 mb-6">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">FlipkartHub</h1>
          <p className="text-muted-foreground">Automate, Analyze, Accelerate your sales</p>
        </div>

        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-white/80">
          <CardContent className="pt-6 pb-8 px-8 text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Sign in to access your seller dashboard</p>
            </div>
            
            <Button 
              size="lg" 
              className="w-full font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
              onClick={handleLogin}
            >
              Sign In with Replit
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
