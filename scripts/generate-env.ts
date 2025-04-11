const fs = require('fs');
const path = require('path');

const environmentTemplate = `
import { Environment } from './environment.interface.ts'
export const environment: Environment = {
  production: false,
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || ''
  },
  openai: {
    key: process.env.OPENAI_API_KEY || '',
    apiUrl: process.env.OPENAI_API_URL || ''
  }
};
`;

const environmentPath = path.join(__dirname, '../src/environments/environment.ts');

fs.writeFileSync(environmentPath, environmentTemplate);
console.log('Environment file generated successfully!');
