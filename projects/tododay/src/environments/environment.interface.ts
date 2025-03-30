export interface Environment {
  production: boolean;
  supabase: {
    url: string;
    key: string;
  };
  openai: {
    key: string;
  };
}
