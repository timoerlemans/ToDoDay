export const environment = {
  production: true,
  supabase: {
    url: '${SUPABASE_URL}',
    key: '${SUPABASE_KEY}'
  },
  openai: {
    key: '${OPENAI_API_KEY}',
    apiUrl: '${OPENAI_API_URL}'
  }
};
