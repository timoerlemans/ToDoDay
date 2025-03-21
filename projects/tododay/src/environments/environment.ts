export * from './environment.development';

export interface Environment {
  production: boolean;
  supabase: {
    url: string;
    key: string;
  };
  openai: {
    key: string;
  }
}

export const environment: Environment = {
  production: false,
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || ''
  },
  openai: {
    key: process.env.OPENAI_API_KEY || ''
  }
};
