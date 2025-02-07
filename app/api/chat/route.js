import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Stream } from "openai/streaming";


// 
const systemPrompt = `You are a customer support AI for HeadstateRAI, a platform that conducts AI-powered interviews for software engineering jobs. Your role is to:

Answer questions about the interview process
Provide technical support for using the platform
Explain how AI is used in the interviews
Assist with account-related issues
Handle inquiries about pricing and plans

Be concise, friendly, and professional. If you can't resolve an issue, offer to escalate it to a human support agent. Prioritize user privacy and data security in your responses.`

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages : [
        {
            role: 'system', 
            content: systemPrompt
        },
        ...data,
    ],
    model: 'gpt-4o-mini',
    stream: true,
    })
    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const cunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err){
                controller.error(err)
            } finally{
                   controller.close()
            }
        },
    })
    return new NextResponse(stream)
}