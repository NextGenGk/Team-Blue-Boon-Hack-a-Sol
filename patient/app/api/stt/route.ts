import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof Blob)) {
            console.error('File missing or invalid');
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log('Received file for STT:', file.size, file.type);

        const apiKey = process.env.RESEMBLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Resemble API key missing' }, { status: 500 });
        }

        const upstreamFormData = new FormData();
        upstreamFormData.append('file', file);

        const response = await fetch('https://app.resemble.ai/api/v2/speech-to-text', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: upstreamFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resemble STT Upload Error:', errorText);
            return NextResponse.json({ error: 'STT Upload failed', details: errorText }, { status: response.status });
        }

        const data = await response.json();
        console.log('Resemble STT Init Response:', data);
        return NextResponse.json(data);

    } catch (error) {
        console.error('STT Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
