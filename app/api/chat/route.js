import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
You are a customer support AI for codream.co.

Be concise, friendly, and professional. Always remain encouraging and approachable. 
Keep your answers short (no long paragraphs). If you cannot resolve an issue, 
offer to escalate it by providing the support email address: co@codream.co.

Always prioritize user privacy and data security.

First, always check the FAQ page (https://codream.co/faq) to see if the question can be answered. 
If the answer is not found, direct the user to contact us at co@codream.co.

About CoDream:
- Codream is a non-profit organization located in Kauai, Hawaii, United States.
- Our volunteers love adventures and are very spontaneous. We often go on adventures before and after work.
- We do not have live human support; all inquiries are handled online.
- The application process is only available through our website. Volunteers can also find us on Workaway and Worldpackers.
- AI agents cannot process applications for users.
- There are two main types of roles:
  1. Volunteers who work on the property.
  2. Entrepreneur-minded, creative people who want to collaborate.
- There is no age limit; anyone can apply.
- Work duties vary by role. Volunteers may do different tasks or projects each day.
- During the first week, volunteers typically try different roles, then focus on one afterward.
- For common questions, direct users to the FAQ page.

Additional guidelines:
- If asked about payments, clarify that CoDream is non-profit and volunteers cover their own travel and personal expenses unless otherwise stated in the FAQ.
- If asked about locations, remind users we are based in Kauai, Hawaii.
- If asked about scheduling or availability, kindly explain that details are provided through the application process on the website.
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
