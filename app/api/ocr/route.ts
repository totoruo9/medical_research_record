import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const files = formData.getAll('file') as File[]
        const type = formData.get('type') as string // 'blood_test' or 'ct_scan'

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
        }

        // Convert files to base64 images/urls
        const contentParts: any[] = [{ type: "text", text: "Extract data from these medical records (which may be multiple pages of the same report). Aggregate the data." }]

        for (const file of files) {
            const buffer = await file.arrayBuffer()
            const base64Image = Buffer.from(buffer).toString('base64')
            const dataUrl = `data:${file.type};base64,${base64Image}`
            contentParts.push({
                type: "image_url",
                image_url: { url: dataUrl }
            })
        }

        let systemPrompt = ''
        if (type === 'blood_test') {
            systemPrompt = `You are a medical data extraction assistant. Extract blood test results from the images. 
      Return ONLY a valid JSON object with the following keys (if value is found, otherwise omit or null):
      {
        "test_date": "YYYY-MM-DD",
        "ca_19_9": number,
        "cea": number,
        "wbc_count": number,
        "rbc_count": number,
        "hemoglobin": number,
        "hct": number,
        "neutrophil": number,
        "amylase": number,
        "lipase": number,
        "ast": number,
        "alt": number,
        "gamma_gt": number,
        "t_bilirubin": number,
        "alk_phos": number,
        "bun": number,
        "creatinine": number,
        "glucose": number,
        "calcium": number,
        "inorganic_p": number,
        "uric_acid": number,
        "total_cholesterol": number,
        "total_protein": number,
        "albumin": number,
        "na": number,
        "k": number,
        "cl": number
      }
      Format dates as YYYY-MM-DD. If year is missing, assume current year. If duplicate fields appear across pages, use the most complete/recent value.`
        } else if (type === 'ct_scan') {
            systemPrompt = `You are a medical data extraction assistant. Extract CT scan details from the images.
      Return ONLY a valid JSON object with these exact keys:
      {
        "scan_date": "YYYY-MM-DD",
        "finding": "full text of interpretation/findings (판독 소견)",
        "doctor_opinion": "conclusion/impression text (담당의 소견/결론)",
        "cancer_size": "extracted size string like '2.5cm' if found"
      }
      Map 'finding' to 'interpretation' in your logic if needed, but return keys: scan_date, finding, doctor_opinion, cancer_size. Combine text from multiple pages if necessary.`
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: contentParts
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 4096,
        })

        const result = JSON.parse(response.choices[0].message.content || '{}')

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('OCR Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
