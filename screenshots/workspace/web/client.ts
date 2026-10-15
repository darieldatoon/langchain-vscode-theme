import { Client } from '@langchain/langgraph-sdk';

const client = new Client({
  apiUrl: process.env.LANGGRAPH_URL ?? 'http://localhost:2024',
});

export interface Question {
  readonly text: string;
  readonly maxSteps?: number;
}

/** Streams the agent's answer as it is written. */
export async function* ask({
  text,
  maxSteps = 10,
}: Question): AsyncGenerator<string> {
  const { thread_id } = await client.threads.create();
  const stream = client.runs.stream(thread_id, 'agent', {
    input: { messages: [{ role: 'user', content: text }] },
    streamMode: 'messages-tuple',
    config: { recursion_limit: maxSteps },
  });

  for await (const { event, data } of stream) {
    if (event === 'messages') yield String(data[0].content);
  }
}
