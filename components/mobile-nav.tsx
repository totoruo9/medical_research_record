'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Menu, Activity, FileText, Brain, ChevronRight, LayoutDashboard, History, LogOut, List, User } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MobileNav() {
    const [open, setOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const navItems = [
        {
            title: '대시보드',
            href: '/dashboard',
            icon: LayoutDashboard
        },
        {
            title: '전체 타임라인',
            href: '/timeline',
            icon: List
        },
        {
            title: '혈액 검사',
            href: '/blood-tests',
            icon: Activity
        },
        {
            title: 'CT 판독',
            href: '/ct-scans',
            icon: FileText
        },
        {
            title: 'iNKt 기록',
            href: '/inkt',
            icon: Activity // Reusing Activity for now or Syringe if available
        },
        {
            title: '지난 분석',
            href: '/reports',
            icon: History
        },
        {
            title: '마이페이지',
            href: '/profile',
            icon: User // Import User from lucide-react
        }
    ]

    if (!isMounted) {
        return (
            <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
        )
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <SheetHeader className="pl-6 text-left">
                    <SheetTitle className="flex items-center">
                        <Image
                            src="/logo_wide.png"
                            alt="이음 (I-Eum)"
                            width={150}
                            height={42}
                            className="object-contain h-[42px] w-auto"
                        />
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-1">
                    <div className="flex flex-col space-y-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center rounded-md p-3 text-sm font-medium transition-colors hover:bg-muted",
                                    pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
                                )}
                            >
                                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                <span className="flex-1">{item.title}</span>
                                {pathname === item.href && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t mt-auto">
                    <Button
                        variant="outline"
                        className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={async () => {
                            const { createClient } = await import('@/lib/supabase/client')
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            window.location.href = '/login'
                        }}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
