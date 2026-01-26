
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

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
                <Link href="/dashboard" className="mr-8 flex items-center gap-2">
                    <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                        Care Platform
                    </span>
                </Link>
                <MainNav className="hidden md:flex mx-4" />
                <div className="ml-auto flex items-center space-x-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-medium text-foreground">
                            {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Patient Account</span>
                    </div>
                    <form
                        className="hidden md:block"
                        action={async () => {
                            "use server"
                            const supabase = await createClient()
                            await supabase.auth.signOut()
                            redirect("/login")
                        }}
                    >
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            로그아웃
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}
