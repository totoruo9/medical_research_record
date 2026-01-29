
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { BLOOD_TEST_RANGES } from '@/lib/constants'

export async function POST(request: Request) {
    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG_ID,
    })

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Fetch recent Blood Tests (Limit 2 for comparison)
        const { data: bloodTests } = await supabase
            .from('blood_tests')
            .select('*')
            .eq('user_id', user.id)
            .order('test_date', { ascending: false })
            .limit(3)

        // 2. Fetch recent CT Scans (Limit 1)
        const { data: ctScans } = await supabase
            .from('ct_scans')
            .select('*')
            .eq('user_id', user.id)
            .order('scan_date', { ascending: false })
            .limit(3)

        // 3. iNKt Records (Limit 1)
        const { data: inktRecords } = await supabase
            .from('inkt_records')
            .select('*')
            .eq('user_id', user.id)
            .order('blood_collection_date', { ascending: false })
            .limit(3)

        if ((!bloodTests || bloodTests.length === 0) && (!ctScans || ctScans.length === 0) && (!inktRecords || inktRecords.length === 0)) {
            return NextResponse.json({
                error: '분석할 데이터가 없습니다. 혈액 검사, CT, 또는 iNKt 기록을 먼저 등록해주세요.'
            }, { status: 400 })
        }

        // 3. Construct Prompt
        const currentData = bloodTests?.[0]
        const previousData = bloodTests?.[1]
        const ctData = ctScans?.[0]
        const inktData = inktRecords?.[0]

        // Format ranges for prompt
        const referenceRangesText = Object.entries(BLOOD_TEST_RANGES)
            .map(([key, val]) => `${val.label}: ${val.min}~${val.max} ${val.unit}`)
            .join('\n')

        let promptData = `
        [Reference Ranges]
        ${referenceRangesText}

        [Patient Data]
        `

        // Format multiple records for context
        if (currentData) {
            promptData += `\n\n[Latest Blood Test - ${currentData.test_date}]\n${JSON.stringify(currentData, null, 2)}`
        }
        if (previousData) {
            promptData += `\n\n[Previous Blood Test - ${previousData.test_date}]\n${JSON.stringify(previousData, null, 2)}`
        }
        if (bloodTests?.[2]) {
            promptData += `\n\n[Earlier Blood Test - ${bloodTests[2].test_date}]\n${JSON.stringify(bloodTests[2], null, 2)}`
        }

        if (ctScans && ctScans.length > 0) {
            promptData += `\n\n[CT Scan Records]`
            ctScans.forEach((ct, idx) => {
                promptData += `\n\nCT Scan ${idx + 1} (${ct.scan_date}):\n${JSON.stringify(ct, null, 2)}`
            })
        }

        if (inktRecords && inktRecords.length > 0) {
            promptData += `\n\n[iNKt Treatment Records - IMPORTANT: Analyze these thoroughly]`
            inktRecords.forEach((inkt, idx) => {
                promptData += `\n\niNKt Treatment ${idx + 1} (${inkt.blood_collection_date}):\n${JSON.stringify(inkt, null, 2)}`
            })
        }

        const systemPrompt = `
        [System Role]
        너는 환자의 의무 기록을 통합적으로 분석하는 전문 AI 헬스케어 분석가야. 
        복잡한 의료 데이터를 환자와 보호자가 한눈에 이해할 수 있도록 가독성 높게 정리하고, 
        데이터 간의 상관관계를 분석하여 구체적인 행동 지침을 제공해야 해. 특정한 질병에 국한하지 않고, 제공된 데이터를 기반으로 객관적인 건강 상태를 분석해줘.
        
        [Output Style]
        - **Headings**: Use Markdown H1 (#) for main sections and H2 (##) for subsections.
        - **Separators**: Insert a horizontal rule (---) after each major section to visually separate content.
        - **Spacing**: Ensure ample whitespace between sections.
        - **Tone**: Professional, encouraging, and clear.
        
        [REPORT STRUCTURE]
        
        # 1. 긴급 주의 사항 (Urgent Alert)
        - IF AND ONLY IF there are critical values (e.g., hypoglycemia < 60, severe electrolyte imbalance), list them here.
        - If stable, output: "특이 사항 없음: 현재 검사 결과는 안정적입니다."
        
        ---

        # 2. 혈액 검사 지표 변화 (Blood Test Trends)
        - Create a Markdown comparison table.
        - Table Header Format: | 항목 | 이전 (Date) | 현재 (Date) | 상태 | 분석 |
        - Replace 'Date' with actual test dates (e.g., 2026-02-04).
        - Highlight significant changes in Glucose, Albumin, Tumor Markers, Electrolytes.
        
        ---

        # 3. 영상 검사 분석 (CT Scan)
        - Analyze Primary Site, Metastasis, Complications.
        
        ---

        # 4. iNKt 치료 방향 제언 (iNKt Treatment Strategy)
        **CRITICAL**: You MUST analyze the iNKt Treatment Records provided in the [Patient Data] section.
        - Review ALL iNKt treatment records provided (treatment dates, dosages, side effects, treatment effects)
        - **Based on**: Treatment dates, frequency, notes (side effects like fever/chills), treatment effectiveness
        - If side effects exist (fever/chills) -> Suggest hydration/rest and discuss with doctor
        - If positive effects noted -> Encourage consistency and continuation
        - If no recent treatments -> Suggest discussing treatment schedule with doctor
        - Compare treatment timeline with blood test results to identify correlations
        
        ---

        # 5. 맞춤형 생활 지침 (Diet & Lifestyle)
        - Specific diet advice based on current lab results.
        
        ---

        # 6. 의료진 상담 가이드 (Questions for Doctor)
        - 3-4 specific questions.
        
        ---

        # 응원 메시지
        - A warm closing message.
        `

        // 4. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Or gpt-4-turbo
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: promptData },
            ],
            temperature: 0.7,
        })

        const analysisResult = completion.choices[0].message.content

        // 5. Save Report
        const { error: saveError } = await supabase.from('ai_reports').insert({
            user_id: user.id,
            content: analysisResult,
            report_date: new Date().toISOString(),
            reference_data: { blood_tests: bloodTests, ct_scans: ctScans, inkt_records: inktRecords }
        })

        if (saveError) {
            console.error('Failed to save report:', saveError)
        }

        return NextResponse.json({ success: true, result: analysisResult })

    } catch (error: any) {
        console.error('AI Analysis Error:', error)
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 })
    }
}
