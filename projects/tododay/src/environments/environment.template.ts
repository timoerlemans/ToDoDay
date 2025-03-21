export const environment = {
  production: false,
  supabase: {
    url: '${SUPABASE_URL}',
    key: '${SUPABASE_KEY}'
  },
  openai: {
    key: '${OPENAI_API_KEY}'
  }
}; 