'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname()

    // 의료 기록 메뉴 활성화 여부 확인
    const isMedicalRecordsActive = pathname?.startsWith("/blood-tests") ||
        pathname?.startsWith("/ct-scans") ||
        pathname?.startsWith("/inkt")

    return (
        <nav
            className={cn("flex items-center space-x-4 lg:space-x-6", className)}
            {...props}
        >
            <Link
                href="/dashboard"
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/dashboard"
                        ? "text-black dark:text-white"
                        : "text-muted-foreground"
                )}
            >
                대시보드
            </Link>

            <DropdownMenu>
                <DropdownMenuTrigger
                    className={cn(
                        "flex items-center text-sm font-medium transition-colors hover:text-primary outline-none",
                        isMedicalRecordsActive
                            ? "text-black dark:text-white"
                            : "text-muted-foreground"
                    )}
                >
                    의료 기록 <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild>
                        <Link href="/timeline" className="w-full cursor-pointer font-medium">전체 타임라인</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/blood-tests" className="w-full cursor-pointer">혈액 검사</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/ct-scans" className="w-full cursor-pointer">CT 판독</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/inkt" className="w-full cursor-pointer">iNKt 기록</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Link
                href="/reports"
                className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/reports"
                        ? "text-black dark:text-white"
                        : "text-muted-foreground"
                )}
            >
                지난 분석 기록
            </Link>
        </nav>
    )
}
