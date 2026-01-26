
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
        <header className="border-b bg-white sticky top-0 z-50">
            <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
                <MobileNav />
                <Link href="/dashboard" className="mr-4 font-bold text-xl text-blue-900 flex items-center">
                    Care Platform
                </Link>
                <MainNav className="mx-6 hidden md:flex" />
                <div className="ml-auto flex items-center space-x-4">
                    <span className="text-sm text-gray-500 hidden md:inline-block">
                        {user.email} 님
                    </span>
                    <form
                        className="hidden md:block"
                        action={async () => {
                            "use server"
                            const supabase = await createClient()
                            await supabase.auth.signOut()
                            redirect("/login")
                        }}
                    >
                        <Button variant="outline" size="sm">
                            로그아웃
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}
