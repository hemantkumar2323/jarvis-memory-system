import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_KEY }));

export default async function handler(req, res) {
  const { query, topK = 5 } = req.query;

  const embeddingRes = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: query,
  });

  const [{ embedding }] = embeddingRes.data.data;

  const { data, error } = await supabase.rpc('match_memory', {
    query_embedding: embedding,
    match_count: topK,
  });

  if (error) return res.status(500).json({ error });
  res.status(200).json({ results: data });
}
