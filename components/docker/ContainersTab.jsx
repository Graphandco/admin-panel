import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MoreHorizontalIcon, RefreshCwIcon, Loader2Icon } from "lucide-react"

function formatCreated(created) {
  if (created == null) return '-'
  const date = typeof created === 'number' ? new Date(created * 1000) : new Date(created)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getContainerName(names) {
  if (!names?.length) return '-'
  return names[0].replace(/^\//, '')
}

function StatusBadge({ state }) {
  const isRunning = state === 'running'
  return (
    <span
      className={cn(
        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
        isRunning
          ? 'bg-green-500/20 text-green-600 dark:text-green-400'
          : 'bg-slate-500/20 text-slate-600 dark:text-slate-400'
      )}
    >
      {isRunning ? 'Running' : 'Stopped'}
    </span>
  )
}

export function ContainersTab({ containers = [], loading, error, onRefresh }) {
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
					className={cn(buttonVariants({  }))}
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
                <TableHead>Nom</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>En ligne depuis</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2Icon className="size-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : containers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun conteneur
                  </TableCell>
                </TableRow>
              ) : (
                containers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {getContainerName(c.names)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{c.image}</TableCell>
                    <TableCell>
                      <StatusBadge state={c.state} />
                    </TableCell>
                    <TableCell>{c.status || '-'}</TableCell>
                    <TableCell>{formatCreated(c.created)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          nativeButton={false}
                          render={
                            <div
                              role="button"
                              tabIndex={0}
                              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                            />
                          }
                        >
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>(re)démarrer</DropdownMenuItem>
                          <DropdownMenuItem>Build</DropdownMenuItem>
                          <DropdownMenuItem>Arrêter</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
