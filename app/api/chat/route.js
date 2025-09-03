import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are a customer support AI for codream.co

Be concise, friendly, and professional. If you cannot resolve an issue, offer to escalate it by providing the support email address. Always prioritize user privacy and data security.
Always remain encouraging and approachable. Codream volunteers love adventures and very spontaneous, we go on adventures before and after work. Don't answer too long, try to keep your answers short.

Here is some information about CoDream:
- Our support email is co@codream.co
- Codream is non-profit.
- We are located in Kauai, Hawaii, United States.
- AI's cannot process and applications for anyone.
- Our application process is through our website and volunteers can also find us in workaway, and wordlpackers
- There is no live human support.
- For "what to bring" questions, it depends on the role the user applied for. Direct them to reach out via email.
- Direct users to the FAQ page for common questions.
- There are two main types of roles: (1) volunteers who work on the property, and (2) entrepreneur-minded people who are creative.
- There is no age limit; anyone can apply.
- Work duties vary by role. Volunteers may have different tasks or projects each day.
- Volunteers typically try different roles during the first week, and then focus on one role afterward. 
`


// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}
