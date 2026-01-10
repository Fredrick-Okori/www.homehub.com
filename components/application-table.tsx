"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Application } from "@/lib/admin-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Mail,
  Phone,
  Calendar,
  Home,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ApplicationTableProps {
  data: Application[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onViewDetails?: (application: Application) => void
}

type SortDirection = "asc" | "desc" | null

interface SortConfig {
  key: keyof Application | null
  direction: SortDirection
}

export function ApplicationTable({
  data,
  onApprove,
  onReject,
  onViewDetails,
}: ApplicationTableProps) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: null, direction: null })
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [replyMessage, setReplyMessage] = React.useState("")

  const handleSort = (key: keyof Application) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" }
        if (prev.direction === "desc") return { key: null, direction: null }
      }
      return { key, direction: "asc" }
    })
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setIsDetailOpen(true)
    onViewDetails?.(application)
  }

  const handleApprove = (id: string) => {
    onApprove?.(id)
    if (selectedApplication?.id === id) {
      setSelectedApplication((prev) => (prev ? { ...prev, status: "approved" } : null))
    }
  }

  const handleReject = (id: string) => {
    if (selectedApplication?.id === id) {
      setSelectedApplication((prev) => (prev ? { ...prev, status: "rejected" } : null))
    }
  }

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let result = [...data]

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (app) =>
          app.applicantName.toLowerCase().includes(query) ||
          app.applicantEmail.toLowerCase().includes(query) ||
          app.listingTitle.toLowerCase().includes(query)
      )
    }

    // Sort
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key!]
        const bVal = b[sortConfig.key!]
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, statusFilter, searchQuery, sortConfig])

  const SortIcon = ({ column }: { column: keyof Application }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="h-4 w-4 ml-2 text-muted-foreground" />
    if (sortConfig.direction === "asc") return <ArrowUp className="h-4 w-4 ml-2" />
    return <ArrowDown className="h-4 w-4 ml-2" />
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={statusFilter === tab.key ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(tab.key)}
              className="gap-2"
            >
              {tab.label}
              <Badge variant="secondary" className="ml-1">
                {tab.key === "all"
                  ? data.length
                  : data.filter((a) => a.status === tab.key).length}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <button
                      onClick={() => handleSort("applicantName")}
                      className="flex items-center hover:text-foreground"
                    >
                      Applicant
                      <SortIcon column="applicantName" />
                    </button>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Property
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                    <button
                      onClick={() => handleSort("applicantPhone")}
                      className="flex items-center hover:text-foreground"
                    >
                      Phone
                      <SortIcon column="applicantPhone" />
                    </button>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">
                    <button
                      onClick={() => handleSort("appliedAt")}
                      className="flex items-center hover:text-foreground"
                    >
                      Applied
                      <SortIcon column="appliedAt" />
                    </button>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((application) => (
                    <tr key={application.id} className="border-t transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{application.applicantName}</p>
                            <p className="text-sm text-muted-foreground hidden sm:block">
                              {application.applicantEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate max-w-[150px]">
                            {application.listingTitle}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{application.applicantPhone}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{application.appliedAt}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge
                          variant={
                            application.status === "approved"
                              ? "default"
                              : application.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {application.status}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(application)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {application.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApprove(application.id)}
                                  className="text-green-600"
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleReject(application.id)}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="h-24 text-center">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {data.length} results
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review the application information</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedApplication.applicantName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge
                      variant={
                        selectedApplication.status === "approved"
                          ? "default"
                          : selectedApplication.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {selectedApplication.status}
                    </Badge>
                    <span>•</span>
                    <span>{selectedApplication.appliedAt}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{selectedApplication.applicantEmail}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{selectedApplication.applicantPhone}</span>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Home className="h-4 w-4" />
                  Property Applied For
                </div>
                <p className="font-medium">{selectedApplication.listingTitle}</p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label>Applicant Message</Label>
                <div className="p-4 rounded-lg bg-secondary/50 text-sm">
                  {selectedApplication.message || "No message provided"}
                </div>
              </div>

              {/* Reply Section */}
              {selectedApplication.status === "pending" && (
                <div className="space-y-3 pt-4 border-t">
                  <Label htmlFor="reply">Send Reply</Label>
                  <Textarea
                    id="reply"
                    placeholder="Type your response..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedApplication?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    handleReject(selectedApplication.id)
                    setIsDetailOpen(false)
                  }}
                >
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApprove(selectedApplication.id)
                    setIsDetailOpen(false)
                  }}
                >
                  Approve Application
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
