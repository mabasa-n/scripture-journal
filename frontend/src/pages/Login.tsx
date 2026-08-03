import { Component } from "react";
import {} from @Component/ui/

export function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${env.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        navigate('/', { replace: true });
      } else {
        setErrorMessage(data.error || 'Login failed.');
      }
    } catch (error) {
      console.error('Network Error:', error);
      setErrorMessage('Network error connecting to backend server.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Scripture Journal</CardTitle>
          <CardDescription>Sign in to save and revisit your scriptures</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrorMessage('Google Login Widget failed to load.')}
          />

          {isVerifying && <p className="text-sm text-muted-foreground">Verifying credentials...</p>}

          {errorMessage && (
            <Alert variant="destructive" className="w-full">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}