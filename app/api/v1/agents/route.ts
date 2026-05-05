export const runtime = 'edge';

const AGENTS = [
  { name: 'supervisor', description: 'Decompose a goal and synthesize sub-task results', tools: ['delegate'] },
  { name: 'researcher', description: 'Search the web and synthesize a sourced brief', tools: ['search_web', 'http_get'] },
  { name: 'analyst', description: 'Read data, find patterns, output a structured report', tools: ['search_web', 'http_get'] },
  { name: 'outreach', description: 'Draft cold email/DM/SMS that does not sound like AI', tools: ['search_web'] },
  { name: 'coder', description: 'Plan and write code from a requirement', tools: ['search_web', 'http_get'] },
  { name: 'planner', description: 'Numbered execution plan from a fuzzy goal', tools: ['search_web'] },
  { name: 'browser', description: 'Crawl pages, extract structured data', tools: ['search_web', 'http_get'] },
  { name: 'designer', description: 'Visual concepts and design briefs', tools: ['image_gen'] },
  { name: 'app_builder', description: 'Single-file HTML+CSS+JS web apps', tools: ['file_save'] },
];

export async function GET(): Promise<Response> {
  return Response.json(
    {
      version: '1.0',
      base_url: 'https://brocco-site.vercel.app/api/v1',
      auth: 'Bearer <brocco_api_key | sk-ant-*>',
      agents: AGENTS,
      models: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
      docs: 'https://brocco-site.vercel.app/docs',
    },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' } },
  );
}
