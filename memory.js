// memory.js
import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// 🔹 Save memory entry
export async function saveMemory({ owner_id, topic, data, version = 1 }) {
  const embedding = await getEmbedding(data)
  const { error } = await supabase.from('memory_log').insert([
    {
      owner_id,
      topic,
      data,
      version,
      embedding
    }
  ])
  return { success: !error, error }
}

// 🔹 Semantic search memory
export async function searchMemory({ owner_id, query, top_k = 5 }) {
  const embedding = await getEmbedding(query)

  const { data, error } = await supabase.rpc('match_memory', {
    query_embedding: embedding,
    match_owner: owner_id,
    match_count: top_k
  })

  return { results: data || [], error }
}

// 🔹 Generate vector using OpenAI
async function getEmbedding(inputText) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: inputText
  })
  return response.data[0].embedding
}
