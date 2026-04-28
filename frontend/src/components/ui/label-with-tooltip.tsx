import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface LabelWithTooltipProps {
  htmlFor?: string
  children: React.ReactNode
  tooltip: string
  className?: string
}

export function LabelWithTooltip({ htmlFor, children, tooltip, className }: LabelWithTooltipProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={htmlFor} className={className}>
        {children}
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle
              className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              aria-label={`Ajuda: ${tooltip}`}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
