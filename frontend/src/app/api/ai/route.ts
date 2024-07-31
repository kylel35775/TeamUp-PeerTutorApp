import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: Request) {
    try {
        //Message from the user
        const { message } = await request.json();
        //API info
        const API_KEY = process.env.OPENAI_API_KEY;
        const API_URL = process.env.OPENAI_API_URl;
        //Headers needed
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
        };
        //Data for OpenAI model containes user's message
        const data = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.'},
                { role: 'user', content: message},
            ],
            max_tokens: 60,
        };
        //Wait for response that includes header and data
        const response = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch AI response');
        }

        const aiResponse = await response.json();
        return NextResponse.json(aiResponse);
    } catch (error) {
        console.error('Error fetching AI response:', error);
        return NextResponse.json({ error: 'Failed to fetch AI response'}, { status: 500 });
    }
}