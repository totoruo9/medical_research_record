"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
    value?: string
    onValueChange?: (value: string) => void
}>({})

const Accordion = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        type?: "single" | "multiple"
        collapsible?: boolean
        value?: string
        onValueChange?: (value: string) => void
    }
>(({ className, type, collapsible, value: controlledValue, onValueChange, children, ...props }, ref) => {
    const [value, setValue] = React.useState<string>(controlledValue || "")

    const handleValueChange = (newValue: string) => {
        const nextValue = value === newValue && collapsible ? "" : newValue
        setValue(nextValue)
        if (onValueChange) {
            onValueChange(nextValue)
        }
    }

    return (
        <AccordionContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <div ref={ref} className={cn("", className)} {...props}>
                {children}
            </div>
        </AccordionContext.Provider>
    )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
    <div ref={ref} className={cn("border-b", className)} data-value={value} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { value, onValueChange } = React.useContext(AccordionContext)
    // Find parent Item value
    // In a real implementation we might use a context for Item too, but here we can hack it or use a proper ItemContext
    // Let's create an ItemContext to be safe
    return (
        <AccordionTriggerImpl className={className} ref={ref} {...props}>
            {children}
        </AccordionTriggerImpl>
    )
})
AccordionTrigger.displayName = "AccordionTrigger"

// Helper to access Item value context
const AccordionItemContext = React.createContext<{ value: string }>({ value: "" })

const AccordionItemWrapper = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => (
    <AccordionItemContext.Provider value={{ value }}>
        <div ref={ref} className={cn("border-b", className)} {...props}>
            {children}
        </div>
    </AccordionItemContext.Provider>
))
AccordionItemWrapper.displayName = "AccordionItem"


const AccordionTriggerImpl = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(AccordionContext)
    const { value: itemValue } = React.useContext(AccordionItemContext)
    const isOpen = selectedValue === itemValue

    return (
        <div className="flex">
            <button
                ref={ref}
                onClick={() => onValueChange?.(itemValue)}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                    className
                )}
                data-state={isOpen ? "open" : "closed"}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </button>
        </div>
    )
})
AccordionTriggerImpl.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { value: selectedValue } = React.useContext(AccordionContext)
    const { value: itemValue } = React.useContext(AccordionItemContext)
    const isOpen = selectedValue === itemValue

    if (!isOpen) return null

    return (
        <div
            ref={ref}
            className="overflow-hidden text-sm transition-all animate-in slide-in-from-top-1 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-1"
            data-state={isOpen ? "open" : "closed"}
            {...props}
        >
            <div className={cn("pb-4 pt-0", className)}>{children}</div>
        </div>
    )
})
AccordionContent.displayName = "AccordionContent"

// Export standard names but use the Wrapper for Item
export { Accordion, AccordionItemWrapper as AccordionItem, AccordionTrigger, AccordionContent }
