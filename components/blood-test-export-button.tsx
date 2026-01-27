'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { format } from "date-fns"
import { BLOOD_TEST_RANGES } from "@/lib/constants"

interface BloodTestExportButtonProps {
    tests: any[]
}

export function BloodTestExportButton({ tests }: BloodTestExportButtonProps) {
    const handleExport = () => {
        if (!tests || tests.length === 0) {
            alert("내보낼 데이터가 없습니다.")
            return
        }

        // 1. Define Headers
        // Basic fields
        const basicHeaders = ['Date', 'Hospital', 'Notes']
        const basicKeys = ['test_date', 'hospital_name', 'notes']

        // Metric fields from constants
        const metricKeys = Object.keys(BLOOD_TEST_RANGES)
        const metricHeaders = metricKeys.map(key => BLOOD_TEST_RANGES[key].label)

        const headers = [...basicHeaders, ...metricHeaders]

        // 2. Format Data Rows
        const rows = tests.map(test => {
            const basicData = basicKeys.map(key => {
                if (key === 'test_date') {
                    return format(new Date(test[key]), 'yyyy-MM-dd')
                }
                // Handle commas in text by wrapping in quotes
                const val = test[key] || ''
                return `"${String(val).replace(/"/g, '""')}"`
            })

            const metricData = metricKeys.map(key => {
                const val = test[key]
                return val !== null && val !== undefined ? val : ''
            })

            return [...basicData, ...metricData].join(',')
        })

        // 3. Combine with BOM for Excel UTF-8 support
        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')

        // 4. Trigger Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `blood_tests_export_${format(new Date(), 'yyyyMMdd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button variant="outline" className="w-full gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            CSV 내보내기
        </Button>
    )
}
