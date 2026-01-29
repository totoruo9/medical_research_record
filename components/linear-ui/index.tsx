// Linear Careers Theme - Component Library
// Based on Linear.app/careers design system

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ChevronDown, MoreHorizontal, Edit2, Trash2, ExternalLink } from "lucide-react"

// ============================================
// THEME TOKENS
// ============================================
export const linearTheme = {
    colors: {
        primary: { white: "var(--linear-primary-white)", black: "var(--linear-primary-black)" },
        gray: {
            25: "var(--linear-gray-25)", 50: "var(--linear-gray-50)", 100: "var(--linear-gray-100)", 200: "var(--linear-gray-200)", 300: "var(--linear-gray-300)",
            400: "var(--linear-gray-400)", 500: "var(--linear-gray-500)", 600: "var(--linear-gray-600)", 700: "var(--linear-gray-700)",
            800: "var(--linear-gray-800)", 900: "var(--linear-gray-900)", 950: "var(--linear-gray-950)"
        },
        text: { primary: "var(--linear-text-primary)", secondary: "var(--linear-text-secondary)", tertiary: "var(--linear-text-tertiary)", inverse: "var(--linear-text-inverse)" },
        accent: { blue: "var(--linear-accent-blue)", purple: "var(--linear-accent-purple)", gradient: "linear-gradient(135deg, var(--linear-accent-blue) 0%, var(--linear-accent-purple) 100%)" },
        state: { success: "var(--linear-state-success)", warning: "var(--linear-state-warning)", error: "var(--linear-state-error)", info: "var(--linear-state-info)" },
        border: { light: "var(--linear-border-light)", default: "var(--linear-border-default)", medium: "var(--linear-border-medium)", dark: "var(--linear-border-dark)" }
    },
    typography: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: { xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem" }
    },
    borderRadius: { none: "0", sm: "2px", default: "4px", md: "6px", lg: "8px", xl: "12px", full: "9999px" },
    shadows: {
        sm: "var(--linear-shadow-sm)",
        default: "var(--linear-shadow-default)",
        md: "var(--linear-shadow-md)",
        lg: "var(--linear-shadow-lg)"
    }
}
// Remove manual overrides for shadows in linearDarkTheme since variables handle it now
export const linearDarkTheme = {
    ...linearTheme,
    name: "Linear Careers Theme - Dark Mode",
    colors: {
        ...linearTheme.colors,
        accent: {
            ...linearTheme.colors.accent,
            gradient: "linear-gradient(135deg, rgba(94, 106, 210, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%)"
        }
    }
}

// ============================================
// BUTTON COMPONENT
// ============================================
const lButtonVariants = cva(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                default: "bg-gray-700 text-white dark:bg-gray-50 dark:text-gray-900 hover:bg-gray-800 active:bg-gray-900",
                secondary: "bg-transparent text-foreground border border-border hover:bg-muted hover:border-gray-300",
                ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                outline: "bg-transparent text-foreground border border-border hover:bg-muted",
                danger: "bg-red-500 text-white hover:bg-red-600",
                link: "bg-transparent text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline p-0"
            },
            size: {
                xs: "h-7 px-2.5 text-xs rounded",
                sm: "h-8 px-3 text-sm rounded",
                default: "h-9 px-4 text-sm rounded",
                lg: "h-11 px-6 text-base rounded-md",
                icon: "h-8 w-8 rounded"
            }
        },
        defaultVariants: { variant: "default", size: "default" }
    }
)

export interface LButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof lButtonVariants> {
    loading?: boolean
}

export const LButton = React.forwardRef<HTMLButtonElement, LButtonProps>(
    ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
        <button ref={ref} className={cn(lButtonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
            {loading && <span className="animate-spin mr-1">⟳</span>}
            {children}
        </button>
    )
)
LButton.displayName = "LButton"

// ============================================
// BADGE COMPONENT
// ============================================
const lBadgeVariants = cva(
    "inline-flex items-center font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                success: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
                warning: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
                error: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
                info: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
                purple: "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
            },
            size: {
                sm: "px-1.5 py-0.5 text-[10px] rounded-sm",
                default: "px-2 py-0.5 text-xs rounded",
                lg: "px-2.5 py-1 text-sm rounded"
            }
        },
        defaultVariants: { variant: "default", size: "default" }
    }
)

export interface LBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof lBadgeVariants> { }

export const LBadge = React.forwardRef<HTMLSpanElement, LBadgeProps>(
    ({ className, variant, size, ...props }, ref) => (
        <span ref={ref} className={cn(lBadgeVariants({ variant, size }), className)} {...props} />
    )
)
LBadge.displayName = "LBadge"

// ============================================
// CARD COMPONENT
// ============================================
// ============================================
// CARD COMPONENT
// ============================================
export const LCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }>(
    ({ className, hover, ...props }, ref) => (
        <div ref={ref} className={cn(
            "bg-card text-card-foreground border border-border rounded-md shadow-sm",
            hover && "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
            className
        )} {...props} />
    )
)
LCard.displayName = "LCard"

export const LCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex items-center gap-3 p-4 border-b border-border", className)} {...props} />
    )
)
LCardHeader.displayName = "LCardHeader"

export const LCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-4", className)} {...props} />
    )
)
LCardContent.displayName = "LCardContent"

export const LCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("font-semibold text-foreground", className)} {...props} />
    )
)
LCardTitle.displayName = "LCardTitle"

export const LCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex items-center gap-2 p-4 pt-0", className)} {...props} />
    )
)
LCardFooter.displayName = "LCardFooter"

// Card with Image
export const LImageCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
    imageSrc?: string; title: string; description?: string; tag?: string; actions?: React.ReactNode
}>(
    ({ className, imageSrc, title, description, tag, actions, ...props }, ref) => (
        <div ref={ref} className={cn("bg-card border border-border rounded-md shadow-sm overflow-hidden", className)} {...props}>
            {imageSrc && <div className="h-40 bg-muted" style={{ background: `url(${imageSrc}) center/cover` }} />}
            <div className="p-4">
                {tag && <span className="inline-block mb-2"><LBadge variant="purple">{tag}</LBadge></span>}
                <h3 className="font-semibold text-foreground">{title}</h3>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                {actions && <div className="mt-3 flex gap-2">{actions}</div>}
            </div>
        </div>
    )
)
LImageCard.displayName = "LImageCard"

// ============================================
// DROPDOWN COMPONENT
// ============================================
export const LDropdown = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { trigger: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>(
    ({ className, trigger, open, onOpenChange, children, ...props }, ref) => {
        const [isOpenState, setIsOpenState] = React.useState(open || false)

        // Determine if controlled or uncontrolled
        const isControlled = open !== undefined
        const isOpen = isControlled ? open : isOpenState

        const handleOpenChange = (newOpen: boolean) => {
            if (!isControlled) {
                setIsOpenState(newOpen)
            }
            onOpenChange?.(newOpen)
        }

        return (
            <div ref={ref} className={cn("relative inline-block", className)} {...props}>
                <div onClick={() => handleOpenChange(!isOpen)}>{trigger}</div>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => handleOpenChange(false)} />
                        <div className="absolute right-0 mt-1 min-w-[160px] bg-popover border border-border rounded shadow-lg z-50">
                            {children}
                        </div>
                    </>
                )}
            </div>
        )
    }
)
LDropdown.displayName = "LDropdown"

export const LDropdownItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }>(
    ({ className, danger, ...props }, ref) => (
        <button ref={ref} className={cn(
            "w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2",
            danger ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-foreground",
            className
        )} {...props} />
    )
)
LDropdownItem.displayName = "LDropdownItem"

// ============================================
// EXPANDABLE CARD
// ============================================
export const LExpandableCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
    title: string; subtitle?: string; defaultOpen?: boolean; onEdit?: () => void; onDelete?: () => void
}>(
    ({ className, title, subtitle, defaultOpen, onEdit, onDelete, children, ...props }, ref) => {
        const [isOpen, setIsOpen] = React.useState(defaultOpen || false)
        return (
            <div ref={ref} className={cn("bg-card border border-border rounded-md", className)} {...props}>
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <div>
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {(onEdit || onDelete) && (
                            <LDropdown trigger={<button className="p-1 hover:bg-gray-100 rounded" onClick={e => e.stopPropagation()}><MoreHorizontal className="h-4 w-4 text-gray-500" /></button>}>
                                {onEdit && <LDropdownItem onClick={onEdit}><Edit2 className="h-3.5 w-3.5" />수정</LDropdownItem>}
                                {onDelete && <LDropdownItem danger onClick={onDelete}><Trash2 className="h-3.5 w-3.5" />삭제</LDropdownItem>}
                            </LDropdown>
                        )}
                        <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                    </div>
                </div>
                {isOpen && <div className="px-4 pb-4 border-t border-border pt-4">{children}</div>}
            </div>
        )
    }
)
LExpandableCard.displayName = "LExpandableCard"

// ============================================
// HEADER COMPONENT
// ============================================
// ============================================
// HEADER COMPONENT
// ============================================
export const LHeader = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({ className, children, ...props }, ref) => (
        <header ref={ref} className={cn("sticky top-0 z-50 h-14 bg-background/95 backdrop-blur border-b border-border", className)} {...props}>
            <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">{children}</div>
        </header>
    )
)
LHeader.displayName = "LHeader"

export const LThemeToggle = () => {
    const [isDark, setIsDark] = React.useState(false)

    React.useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'))
    }, [])

    const toggleTheme = () => {
        const isNowDark = document.documentElement.classList.toggle('dark')
        setIsDark(isNowDark)
        localStorage.setItem('theme', isNowDark ? 'dark' : 'light')
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
        </button>
    )
}

// ============================================
// FOOTER COMPONENT
// ============================================
export const LFooter = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({ className, children, ...props }, ref) => (
        <footer ref={ref} className={cn("bg-background text-muted-foreground border-t border-border py-12", className)} {...props}>
            <div className="max-w-7xl mx-auto px-4">{children}</div>
        </footer>
    )
)
LFooter.displayName = "LFooter"

export const LFooterSection = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { title: string }>(
    ({ className, title, children, ...props }, ref) => (
        <div ref={ref} className={cn("", className)} {...props}>
            <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
            <div className="space-y-2 text-sm">{children}</div>
        </div>
    )
)
LFooterSection.displayName = "LFooterSection"

export const LFooterLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
    ({ className, ...props }, ref) => (
        <a ref={ref} className={cn("block hover:text-foreground transition-colors", className)} {...props} />
    )
)
LFooterLink.displayName = "LFooterLink"

// ============================================
// HERO SECTION
// ============================================
export const LHero = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { variant?: "default" | "centered" | "gradient" }>(
    ({ className, variant = "default", children, ...props }, ref) => (
        <section ref={ref} className={cn(
            "py-20 px-4",
            variant === "centered" && "text-center",
            variant === "gradient" && "text-center text-white",
            className
        )} style={variant === "gradient" ? { background: linearTheme.colors.accent.gradient } : undefined} {...props}>
            <div className="max-w-4xl mx-auto">{children}</div>
        </section>
    )
)
LHero.displayName = "LHero"

export const LHeroTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h1 ref={ref} className={cn("text-4xl md:text-5xl font-bold tracking-tight", className)} {...props} />
    )
)
LHeroTitle.displayName = "LHeroTitle"

export const LHeroSubtitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-lg md:text-xl mt-4 opacity-80", className)} {...props} />
    )
)
LHeroSubtitle.displayName = "LHeroSubtitle"

// ============================================
// PROFILE COMPONENT
// ============================================
export const LProfile = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
    name: string; email?: string; avatarSrc?: string; onLogout?: () => void
}>(
    ({ className, name, email, avatarSrc, onLogout, ...props }, ref) => {
        const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        return (
            <LDropdown trigger={
                <button className="flex items-center gap-2 p-1 hover:bg-muted rounded text-foreground">
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                        {avatarSrc ? <img src={avatarSrc} alt={name} className="rounded-full w-full h-full object-cover" /> : initials}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
            }>
                <div className="px-3 py-2 border-b border-border">
                    <p className="font-medium text-foreground text-sm">{name}</p>
                    {email && <p className="text-xs text-muted-foreground">{email}</p>}
                </div>
                <LDropdownItem><ExternalLink className="h-3.5 w-3.5" />프로필</LDropdownItem>
                {onLogout && <LDropdownItem danger onClick={onLogout}>로그아웃</LDropdownItem>}
            </LDropdown>
        )
    }
)
LProfile.displayName = "LProfile"

// ============================================
// NAVIGATION
// ============================================
export const LNav = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({ className, ...props }, ref) => (
        <nav ref={ref} className={cn("flex items-center gap-1", className)} {...props} />
    )
)
LNav.displayName = "LNav"

export const LNavLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }>(
    ({ className, active, ...props }, ref) => (
        <a ref={ref} className={cn(
            "px-3 py-1.5 rounded text-sm font-medium transition-colors",
            active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            className
        )} {...props} />
    )
)
LNavLink.displayName = "LNavLink"

// ============================================
// ALERT COMPONENT
// ============================================
const alertVariants = {
    info: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", text: "text-blue-800 dark:text-blue-300" },
    success: { bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", text: "text-green-800 dark:text-green-300" },
    warning: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-800 dark:text-amber-300" },
    error: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", text: "text-red-800 dark:text-red-300" }
}

export const LAlert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof alertVariants }>(
    ({ className, variant = "info", children, ...props }, ref) => {
        const v = alertVariants[variant]
        return (
            <div ref={ref} className={cn("flex items-start gap-3 p-3 rounded border", v.bg, v.border, v.text, className)} {...props}>
                {children}
            </div>
        )
    }
)
LAlert.displayName = "LAlert"

// ============================================
// INPUT COMPONENT
// ============================================
export const LInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
    ({ className, label, error, disabled, ...props }, ref) => (
        <div className="flex flex-col gap-1">
            {label && <label className={cn("text-sm font-medium", disabled ? "text-muted-foreground" : "text-foreground")}>{label}</label>}
            <input ref={ref} disabled={disabled} className={cn(
                "h-9 px-3 border rounded text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-background text-foreground",
                error ? "border-red-300 bg-red-50 dark:bg-red-900/10" : "border-input",
                disabled && "bg-muted text-muted-foreground cursor-not-allowed",
                className
            )} {...props} />
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    )
)
LInput.displayName = "LInput"

// ============================================
// MODAL / POPUP COMPONENT
// ============================================
export const LModal = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
    open: boolean; onClose: () => void; title?: string; size?: "sm" | "default" | "lg"
}>(
    ({ className, open, onClose, title, size = "default", children, ...props }, ref) => {
        if (!open) return null
        const sizes = { sm: "max-w-sm", default: "max-w-md", lg: "max-w-2xl" }
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black/50" onClick={onClose} />
                <div ref={ref} className={cn("relative bg-background rounded-md shadow-xl w-full mx-4", sizes[size], className)} {...props}>
                    {title && (
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <h3 className="font-semibold text-foreground">{title}</h3>
                            <button onClick={onClose} className="p-1 hover:bg-muted rounded text-muted-foreground">✕</button>
                        </div>
                    )}
                    <div className="p-4">{children}</div>
                </div>
            </div>
        )
    }
)
LModal.displayName = "LModal"

export const LModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30 rounded-b-md", className)} {...props} />
    )
)
LModalFooter.displayName = "LModalFooter"

// ============================================
// AVATAR COMPONENT
// ============================================
export const LAvatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { name?: string; src?: string; size?: "sm" | "default" | "lg" }>(
    ({ className, name, src, size = "default", ...props }, ref) => {
        const sizes = { sm: "h-6 w-6 text-xs", default: "h-8 w-8 text-sm", lg: "h-11 w-11 text-base" }
        const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
        return (
            <div ref={ref} className={cn("rounded-full flex items-center justify-center font-medium", src ? "" : "bg-blue-500 text-white", sizes[size], className)} {...props}>
                {src ? <img src={src} alt={name} className="rounded-full w-full h-full object-cover" /> : initials}
            </div>
        )
    }
)
LAvatar.displayName = "LAvatar"

// ============================================
// METRIC DISPLAY
// ============================================
export const LMetricCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
    label: string; value: string | number; status?: "normal" | "warning" | "danger"
}>(
    ({ className, label, value, status = "normal", ...props }, ref) => {
        const statusColors = { normal: "text-green-600 dark:text-green-500", warning: "text-amber-600 dark:text-amber-500", danger: "text-red-600 dark:text-red-500" }
        return (
            <div ref={ref} className={cn("flex flex-col gap-1", className)} {...props}>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
                <span className={cn("text-xl font-bold", statusColors[status])}>{value}</span>
            </div>
        )
    }
)
LMetricCard.displayName = "LMetricCard"

// ============================================
// EMPTY STATE
// ============================================
export const LEmptyState = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("text-center py-12 text-muted-foreground", className)} {...props}>{children}</div>
    )
)
LEmptyState.displayName = "LEmptyState"

// ============================================
// TABS COMPONENT
// ============================================
export const LTabs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { defaultValue: string, onValueChange?: (value: string) => void }>(
    ({ className, defaultValue, onValueChange, children, ...props }, ref) => {
        const [activeTab, setActiveTab] = React.useState(defaultValue)

        const handleTabChange = (value: string) => {
            setActiveTab(value)
            onValueChange?.(value)
        }

        return (
            <div ref={ref} className={cn("", className)} {...props}>
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, { activeTab, onTabChange: handleTabChange } as any)
                    }
                    return child
                })}
            </div>
        )
    }
)
LTabs.displayName = "LTabs"

export const LTabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { activeTab?: string, onTabChange?: (value: string) => void }>(
    ({ className, children, activeTab, onTabChange, ...props }, ref) => (
        <div ref={ref} className={cn("inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { activeTab, onTabChange } as any)
                }
                return child
            })}
        </div>
    )
)
LTabsList.displayName = "LTabsList"

export const LTabsTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string, activeTab?: string, onTabChange?: (value: string) => void }>(
    ({ className, value, activeTab, onTabChange, children, ...props }, ref) => (
        <button
            ref={ref}
            type="button"
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                activeTab === value ? "bg-background text-foreground shadow-sm" : "hover:bg-muted/50 hover:text-foreground",
                className
            )}
            onClick={() => onTabChange?.(value)}
            {...props}
        >
            {children}
        </button>
    )
)
LTabsTrigger.displayName = "LTabsTrigger"

export const LTabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string, activeTab?: string }>(
    ({ className, value, activeTab, children, ...props }, ref) => {
        const { onTabChange, ...domProps } = props as any

        if (value !== activeTab) return null
        return (
            <div ref={ref} className={cn("mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...domProps}>
                {children}
            </div>
        )
    }
)
LTabsContent.displayName = "LTabsContent"

// ============================================
// TIMELINE COMPONENT
// ============================================
export const LTimeline = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("relative space-y-8 pl-4", className)} {...props}>
            {/* Main vertical line */}
            <div className="absolute left-[27px] top-4 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />
            {children}
        </div>
    )
)
LTimeline.displayName = "LTimeline"

export const LTimelineDate = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("relative z-10 inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 mb-4", className)} {...props}>
            {children}
        </div>
    )
)
LTimelineDate.displayName = "LTimelineDate"

export const LTimelineItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("relative flex gap-6", className)} {...props}>
            {children}
        </div>
    )
)
LTimelineItem.displayName = "LTimelineItem"

export const LTimelineIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "success" | "danger" }>(
    ({ className, variant = "default", children, ...props }, ref) => {
        const variants = {
            default: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
            success: "bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
            danger: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
        }
        return (
            <div ref={ref} className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm",
                variants[variant],
                className
            )} {...props}>
                {children}
            </div>
        )
    }
)
LTimelineIcon.displayName = "LTimelineIcon"

export const LTimelineContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("flex-1 min-w-0 pt-1.5", className)} {...props}>
            {children}
        </div>
    )
)
LTimelineContent.displayName = "LTimelineContent"

// ============================================
// EXPORTS
// ============================================
export { lButtonVariants, lBadgeVariants }
