const { NextResponse } = require("next/server");
const OpenAI = require("openai");

const systemPrompt = `you are an AI-powered customer support assistant for HeadstartAI, a platform that provides AI-driven interviews for software

1. HeadStartAI offers AI-powered interviews for software engineering positions.
2. Our platform helps candidates practice and prepare for real job interviews.
3. We cover a wide range of topics including algorithms, data structures, system design, and behavioral questions.
4. Users can access our services through our website or mobile app.
5. If asked about technical issues, guide users to our troubleshooting page or suggest contacting our technical support team.
6. Always maintain user privacy and do not share personal information.
7. If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.

Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStartAI users.`;

async function POST(req) {
  const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [{
      role: "system",
      content: systemPrompt
    }],
    ...data,
    model: 'gpt-4o-mini',
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encode = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0].delta.content;
          if (content) {
            const text = encode.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    }
  });

  return new NextResponse(stream);
}

module.exports = { POST };
