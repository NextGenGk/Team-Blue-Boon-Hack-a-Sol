import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const apiKey = process.env.RESEMBLE_API_KEY;
        const projectUuid = process.env.RESEMBLE_PROJECT_UUID;
        const voiceUuid = process.env.RESEMBLE_VOICE_UUID;

        // Mock response if keys are missing (to allow testing without keys)
        if (!apiKey || !projectUuid || !voiceUuid) {
            console.warn('Resemble AI keys missing, returning mock success');
            return NextResponse.json({
                mock: true,
                message: "Resemble keys missing. Configure RESEMBLE_API_KEY, RESEMBLE_PROJECT_UUID, RESEMBLE_VOICE_UUID."
            });
        }

        const response = await fetch(`https://p.cluster.resemble.ai/tts`, {
            method: 'POST',
            headers: {
                'Authorization': `Token token=${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                project_uuid: projectUuid,
                voice_uuid: voiceUuid,
                data: text,
                precision: 'mp3',
                sync: true
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Resemble TTS Error:', err);
            return NextResponse.json({ error: 'TTS Generation failed', details: err }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('TTS Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
