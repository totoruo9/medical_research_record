
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from 'next/image'

export async function SiteHeader() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <MobileNav />
                <Link href="/dashboard" className="mr-8 flex items-center">
                    <Image
                        src="/logo_wide.png"
                        alt="이음 (I-Eum)"
                        width={180}
                        height={55}
                        className="object-contain h-10 md:h-12 w-auto"
                        priority
                        unoptimized
                    />
                </Link>
                <MainNav className="hidden md:flex mx-4" />
                <div className="ml-auto flex items-center space-x-4">
                    <UserNav user={user} />
                </div>
            </div >
        </header >
    )
}
