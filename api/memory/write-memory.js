import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_KEY }));

export default async function handler(req, res) {
  const { topic, data } = req.body;
  const input = JSON.stringify(data);

  const embeddingRes = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input,
  });

  const [{ embedding }] = embeddingRes.data.data;

  const { error } = await supabase.from('memory_log').insert({
    topic,
    data,
    embedding,
  });

  if (error) return res.status(500).json({ error });
  res.status(200).json({ success: true });
}
