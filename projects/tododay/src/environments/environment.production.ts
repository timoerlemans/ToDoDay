import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  supabase: {
    url: 'https://gwntoxeiracsqifubzkn.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3bnRveGVpcmFjc3FpZnViemtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NDk3MzcsImV4cCI6MjA1ODEyNTczN30.km6AJwZpH8pFd9yZwwMGqLhwlH6N5-uF5VKDBBGU4NE'
  },
  openai: {
    key: 'your_openai_api_key'
  }
}; 