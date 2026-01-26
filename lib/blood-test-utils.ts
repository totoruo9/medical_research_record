
import { BLOOD_TEST_RANGES } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

export const getStatus = (key: string, value: number) => {
    const range = BLOOD_TEST_RANGES[key]
    if (!range || value === null || value === undefined) return { color: 'text-gray-500', icon: null, badge: null, dotColor: '#8884d8' }

    const { min, max } = range

    // Normal Range
    if (value >= min && value <= max) {
        return {
            color: 'text-green-600',
            icon: null,
            badgeVariant: 'outline',
            badgeClassName: "text-green-600 border-green-200 bg-green-50 text-[10px] px-1 py-0 h-4",
            badgeLabel: 'Normal',
            dotColor: '#16a34a' // green-600
        }
    }

    // Deviation Calculation
    const isLow = value < min
    const diff = isLow ? min - value : value - max
    const limit = isLow ? min : max
    const ratio = diff / limit // deviation ratio

    // Color Logic: Yellow (Interest) -> Orange (Caution) -> Red (Danger)
    let colorClass = 'text-yellow-600'
    let badgeColorClass = 'text-yellow-600 border-yellow-200 bg-yellow-50'
    let dotColor = '#ca8a04' // yellow-600
    let label = 'Interest'

    if (ratio > 0.3) { // >30% deviation
        colorClass = 'text-red-600'
        badgeColorClass = 'text-red-600 border-red-200 bg-red-50'
        dotColor = '#dc2626' // red-600
        label = 'Danger'
    } else if (ratio > 0.1) { // 10-30% deviation
        colorClass = 'text-orange-500' // orange-500 for better visibility than 600 sometimes
        badgeColorClass = 'text-orange-600 border-orange-200 bg-orange-50'
        dotColor = '#f97316' // orange-500
        label = 'Caution'
    }

    return {
        color: colorClass,
        iconLabel: isLow ? '▼' : '▲',
        badgeVariant: 'outline',
        badgeClassName: `${badgeColorClass} text-[10px] px-1 py-0 h-4`,
        badgeLabel: label,
        dotColor: dotColor
    }
}
