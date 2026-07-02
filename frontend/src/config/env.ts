function requireEnv(name: string): string {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

export const env = {
  apiUrl: requireEnv("VITE_API_URL"),
  googleClientId: requireEnv("VITE_GOOGLE_CLIENT_ID"),
};
