const fs = require('fs');
const path = require('path');

const environmentTemplate = `
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
`;

const environmentPath = path.join(__dirname, '../projects/tododay/src/environments/environment.ts');

fs.writeFileSync(environmentPath, environmentTemplate);
console.log('Environment file generated successfully!'); 