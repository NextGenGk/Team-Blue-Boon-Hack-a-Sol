import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const uuid = params.id;

        if (!uuid) {
            return NextResponse.json({ error: 'UUID is required' }, { status: 400 });
        }

        const apiKey = process.env.RESEMBLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Resemble API key missing' }, { status: 500 });
        }

        const response = await fetch(`https://app.resemble.ai/api/v2/speech-to-text/${uuid}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resemble STT Check Error:', errorText);
            return NextResponse.json({ error: 'STT Status check failed', details: errorText }, { status: response.status });
        }

        const data = await response.json();
        console.log(`STT Status Check [${uuid}]:`, data.item?.status);
        return NextResponse.json(data);

    } catch (error) {
        console.error('STT Status Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
