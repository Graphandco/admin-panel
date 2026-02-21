"use client"

import { useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { RefreshCwIcon, Loader2Icon, ExternalLinkIcon, CopyIcon } from "lucide-react"

function CopyIpButton({ ip }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(ip)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Tooltip open={copied}>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={handleCopy}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-7 w-7 hover:text-primary cursor-pointer')}
          >
            <CopyIcon className="size-3.5" />
          </button>
        }
      />
      <TooltipContent side="top">
        {copied ? 'Copié !' : "Copier l'IP"}
      </TooltipContent>
    </Tooltip>
  )
}

export const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

export function isDeviceActive(device) {
  const lastSeen = device.lastSeen
  if (!lastSeen) return false
  const ts = typeof lastSeen === 'string' ? new Date(lastSeen).getTime() : lastSeen * 1000
  return Date.now() - ts < ACTIVE_THRESHOLD_MS
}

function getDeviceIp(device) {
  const addrs = device.addresses ?? device.addrs ?? []
  const list = Array.isArray(addrs) ? addrs : []
  const str = (a) => {
    const s = typeof a === 'string' ? a : a?.addr ?? a?.Addr ?? ''
    return s.split('/')[0] || s // strip CIDR suffix
  }
  const ipv4 = list.map(str).find(a => a && !a.includes(':')) ?? list.map(str).find(Boolean)
  return ipv4 ?? '-'
}

/** URL : utilise name tel quel (ex: ipad-air-4.springbok-arcturus.ts.net) */
function getDeviceUrl(device) {
  const name = device.name ?? device.hostname ?? device.id
  if (!name) return null
  return `https://${name}`
}

/** Nom affiché : tronque le suffixe tailnet (ex: ipad-air-4.springbok-arcturus.ts.net → ipad-air-4) */
function getDeviceDisplayName(device, tailnet) {
  const fullName = device.name ?? device.hostname ?? device.id ?? ''
  if (!fullName) return '-'
  if (!tailnet || !fullName.endsWith('.' + tailnet)) return fullName
  return fullName.slice(0, -(tailnet.length + 1)) // retire .tailnet
}

function StatusBadge({ active }) {
  return (
    <span
      className={cn(
        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
        active
          ? 'bg-green-500/20 text-green-600 dark:text-green-400'
          : 'bg-slate-500/20 text-slate-600 dark:text-slate-400'
      )}
    >
      {active ? 'Actif' : 'Inactif'}
    </span>
  )
}

export function DevicesTab({ devices = [], tailnet, loading, error, onRefresh }) {
  if (error) {
    return (
      <Card className="my-6 p-6">
        <div className="text-destructive flex items-center gap-3">
          <p>{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <RefreshCwIcon className="size-4 mr-1" />
              Réessayer
            </button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="my-6">
      <div className="flex justify-end items-center pb-4 px-1">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className={cn(buttonVariants({}))}
          >
            {loading ? (
              <Loader2Icon className="size-4 mr-1 animate-spin" />
            ) : (
              <RefreshCwIcon className="size-4 mr-1" />
            )}
            Actualiser
          </button>
        )}
      </div>
      <Card className="mb-6 p-0">
        <CardContent>
          <Table>
            <TableHeader className="bg-muted text-white">
              <TableRow>
                <TableHead><span className="pl-2">Appareil</span></TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucun appareil
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => {
                  const active = isDeviceActive(device)
                  const url = getDeviceUrl(device)
                  const displayName = getDeviceDisplayName(device, tailnet)
                  return (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium text-sm">
                        <span className="pl-2">{displayName}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={active} />
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="min-w-24">
                            {getDeviceIp(device)}
                          </span>
                          {getDeviceIp(device) !== '-' && (
                            <CopyIpButton ip={getDeviceIp(device)} />
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 pr-2  hover:text-primary"
                          >
                            {url.replace(/^https?:\/\//, '')}
                            <ExternalLinkIcon className="size-3" />
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
