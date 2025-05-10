import { createClient } from '@supabase/supabase-js'
import { Configuration, OpenAIApi } from 'openai'
import 'dotenv/config'

// 🔑 ENV VARIABLES
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_KEY
}))

async function saveMemory(topic, content) {
  // 🔍 Generate embedding vector
  const embeddingResponse = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: content,
  })

  const [{ embedding }] = embeddingResponse.data.data

  // 🧠 Save to Supabase
  const { data, error } = await supabase
    .from('memory_log')
    .insert([
      {
        topic,
        data: { content },
        embedding,
        version: 1,
      }
    ])

  if (error) {
    console.error('❌ Memory Save Error:', error)
  } else {
    console.log('✅ Memory Saved:', data)
  }
}

saveMemory("startup_plan", "We are building an AI COO system that evolves automatically.")
