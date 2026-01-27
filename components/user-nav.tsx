'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/lib/actions/user"

interface UserNavProps {
    user: any
}

export function UserNav({ user }: UserNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                        <AvatarFallback><UserCircle className="h-6 w-6 text-gray-400" /></AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer font-medium w-full block">
                        개인정보 관리
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600" onClick={async () => {
                    await signOut()
                }}>
                    로그아웃
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
