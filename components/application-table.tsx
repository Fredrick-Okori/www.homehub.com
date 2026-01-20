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
import { Application as FullApplication } from "@/lib/applications"
import { getPresignedUrls } from "@/lib/s3-presigned"
import Image from "next/image"
import { Loader2, FileImage, Download, FileDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ApplicationTableProps {
  data: Application[]
  fullApplications?: FullApplication[] // Full application data with all fields
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
  fullApplications = [],
  onApprove,
  onReject,
  onViewDetails,
}: ApplicationTableProps) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: null, direction: null })
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null)
  const [selectedFullApplication, setSelectedFullApplication] = React.useState<FullApplication | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [replyMessage, setReplyMessage] = React.useState("")
  const [imageUrls, setImageUrls] = React.useState<Map<string, string>>(new Map())
  const [loadingImages, setLoadingImages] = React.useState(false)
  const [listingDetails, setListingDetails] = React.useState<{ id: string; title: string; description: string | null; images: string[] | null } | null>(null)
  const [loadingListing, setLoadingListing] = React.useState(false)
  const [listingImageUrls, setListingImageUrls] = React.useState<Map<string, string>>(new Map())
  const [generatingPDF, setGeneratingPDF] = React.useState(false)
  const supabase = createClient()

  const handleSort = (key: keyof Application) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" }
        if (prev.direction === "desc") return { key: null, direction: null }
      }
      return { key, direction: "asc" }
    })
  }

  const handleViewDetails = async (application: Application) => {
    setSelectedApplication(application)
    setIsDetailOpen(true)
    
    // Find the full application data
    const fullApp = fullApplications.find((app) => app.id === application.id)
    setSelectedFullApplication(fullApp || null)
    
    // Fetch listing details
    if (fullApp) {
      setLoadingListing(true)
      try {
        const { data: listing, error } = await supabase
          .from('listings')
          .select('id, title, description, images')
          .eq('id', fullApp.listing_id)
          .single()
        
        if (!error && listing) {
          setListingDetails(listing)
          
          // Load pre-signed URLs for listing images
          if (listing.images && listing.images.length > 0) {
            const listingPresignedMap = await getPresignedUrls(listing.images)
            setListingImageUrls(listingPresignedMap)
          }
        }
      } catch (error) {
        console.error('Error fetching listing:', error)
      } finally {
        setLoadingListing(false)
      }
      
      // Load pre-signed URLs for application images
      setLoadingImages(true)
      try {
        const imageUrlList: string[] = []
        if (fullApp.national_id_front_url) imageUrlList.push(fullApp.national_id_front_url)
        if (fullApp.national_id_back_url) imageUrlList.push(fullApp.national_id_back_url)
        if (fullApp.passport_photo_url) imageUrlList.push(fullApp.passport_photo_url)
        if (fullApp.passport_particulars_url) imageUrlList.push(fullApp.passport_particulars_url)
        if (fullApp.applicant_photo_url) imageUrlList.push(fullApp.applicant_photo_url)
        if (fullApp.employment_contract_url) imageUrlList.push(fullApp.employment_contract_url)
        
        if (imageUrlList.length > 0) {
          const presignedMap = await getPresignedUrls(imageUrlList)
          setImageUrls(presignedMap)
        }
      } catch (error) {
        console.error('Error loading images:', error)
      } finally {
        setLoadingImages(false)
      }
    }
    
    onViewDetails?.(application)
  }

  // Download all as PDF
  const handleDownloadPDF = async () => {
    if (!selectedFullApplication || !listingDetails) {
      alert('Application or listing information is missing')
      return
    }
    
    setGeneratingPDF(true)
    
    try {
      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf')
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20
      const margin = 15
      const contentWidth = pageWidth - (margin * 2)
      const lineHeight = 7
      const sectionSpacing = 12
      
      // Helper function to add a new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
          return true
        }
        return false
      }
      
      // Helper function to draw a bordered box
      const drawBorderedBox = (x: number, y: number, width: number, height: number, title?: string) => {
        // Draw border
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.5)
        pdf.rect(x, y, width, height)
        
        // Draw inner border for depth
        pdf.setDrawColor(220, 220, 220)
        pdf.setLineWidth(0.2)
        pdf.rect(x + 0.5, y + 0.5, width - 1, height - 1)
        
        // Draw title background if provided
        if (title) {
          pdf.setFillColor(240, 240, 240)
          pdf.rect(x, y, width, 8, 'F')
          pdf.setDrawColor(200, 200, 200)
          pdf.setLineWidth(0.3)
          pdf.line(x, y + 8, x + width, y + 8)
        }
      }
      
      // Helper function to add a table row
      const addTableRow = (label: string, value: string, x: number, y: number, labelWidth: number, valueWidth: number, rowHeight: number = lineHeight) => {
        // Calculate text heights first
        pdf.setFontSize(9)
        const labelLines = pdf.splitTextToSize(label, labelWidth - 4)
        const valueLines = pdf.splitTextToSize(value || 'N/A', valueWidth - 4)
        
        // Calculate actual height needed - use line spacing of 4.5mm per line
        const labelHeight = labelLines.length * 4.5
        const valueHeight = valueLines.length * 4.5
        const actualHeight = Math.max(rowHeight, Math.max(labelHeight, valueHeight) + 3)
        
        // Background for label
        pdf.setFillColor(245, 245, 245)
        pdf.rect(x, y, labelWidth, actualHeight, 'F')
        
        // Border
        pdf.setDrawColor(220, 220, 220)
        pdf.setLineWidth(0.2)
        pdf.rect(x, y, labelWidth + valueWidth, actualHeight)
        pdf.line(x + labelWidth, y, x + labelWidth, y + actualHeight)
        
        // Text - position based on number of lines
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(60, 60, 60)
        let labelY = y + 4.5
        labelLines.forEach((line: string) => {
          pdf.text(line, x + 2, labelY)
          labelY += 4.5
        })
        
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(0, 0, 0)
        let valueY = y + 4.5
        valueLines.forEach((line: string) => {
          pdf.text(line, x + labelWidth + 2, valueY)
          valueY += 4.5
        })
        
        return actualHeight
      }
      
      // Helper to load image as data URL using server-side API (bypasses CORS)
      const loadImageAsDataURL = async (url: string): Promise<string> => {
        try {
          // Use our API route to fetch image server-side (bypasses CORS)
          const response = await fetch('/api/image-to-base64', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to fetch image')
          }

          const data = await response.json()
          return data.dataUrl
        } catch (error) {
          console.error('Error loading image via API:', url, error)
          // Fallback: try direct image loading (may fail due to CORS)
          return new Promise((resolve, reject) => {
            const img = new window.Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                  reject(new Error('Could not get canvas context'))
                  return
                }
                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)
                resolve(canvas.toDataURL('image/jpeg', 0.7))
              } catch (canvasError) {
                reject(canvasError)
              }
            }
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
            img.src = url
          })
        }
      }
      
      // Title with border
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(30, 30, 30)
      const titleWidth = contentWidth
      const titleBoxHeight = 12
      drawBorderedBox(margin, yPosition - 8, titleWidth, titleBoxHeight, 'Application Details')
      pdf.text('Application Details', margin + 5, yPosition)
      yPosition += titleBoxHeight + sectionSpacing
      
      // Listing Information Section with bordered box
      checkPageBreak(60)
      const listingSectionY = yPosition
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(30, 30, 30)
      
      const listingTableStartY = yPosition + 8
      let listingTableY = listingTableStartY
      const labelWidth = 45
      const valueWidth = contentWidth - labelWidth
      
      // Add table rows
      const listingIdHeight = addTableRow('Listing ID', listingDetails.id, margin, listingTableY, labelWidth, valueWidth)
      listingTableY += listingIdHeight
      
      const titleHeight = addTableRow('Title', listingDetails.title, margin, listingTableY, labelWidth, valueWidth)
      listingTableY += titleHeight
      
      if (listingDetails.description) {
        // Don't set fixed height for description - let it calculate dynamically
        const descHeight = addTableRow('Description', listingDetails.description, margin, listingTableY, labelWidth, valueWidth)
        listingTableY += descHeight
      }
      
      const listingSectionHeight = listingTableY - listingSectionY + 10
      drawBorderedBox(margin, listingSectionY, contentWidth, listingSectionHeight, 'Property Listing Information')
      yPosition = listingTableY + 5
      
      // Listing Images with border
      if (listingDetails.images && listingDetails.images.length > 0) {
        checkPageBreak(50)
        const imagesSectionY = yPosition
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(30, 30, 30)
        
        const imagesStartY = yPosition + 8
        let imagesY = imagesStartY
        const imgWidth = 40  // Reduced from 50
        const imgHeight = 28  // Reduced from 35
        const imgSpacing = 4
        const imagesPerRow = 3
        let imagesInRow = 0
        
        for (let i = 0; i < Math.min(listingDetails.images.length, 3); i++) {
          const imageUrl = listingImageUrls.get(listingDetails.images[i]) || listingDetails.images[i]
          try {
            const imgData = await loadImageAsDataURL(imageUrl)
            
            const imgX = margin + (imagesInRow * (imgWidth + imgSpacing))
            checkPageBreak(imgHeight + 10)
            
            // Draw border around image
            pdf.setDrawColor(200, 200, 200)
            pdf.setLineWidth(0.3)
            pdf.rect(imgX - 1, imagesY - 1, imgWidth + 2, imgHeight + 2)
            
            pdf.addImage(imgData, 'JPEG', imgX, imagesY, imgWidth, imgHeight)
            
            imagesInRow++
            if (imagesInRow >= imagesPerRow) {
              imagesY += imgHeight + imgSpacing
              imagesInRow = 0
            }
          } catch (error) {
            console.error(`Error loading listing image ${i}:`, error)
            // Add placeholder text if image fails
            pdf.setFontSize(8)
            pdf.setFont('helvetica', 'italic')
            pdf.setTextColor(150, 150, 150)
            pdf.text(`[Image ${i + 1} unavailable]`, margin + (imagesInRow * (imgWidth + imgSpacing)), imagesY + imgHeight / 2)
            imagesInRow++
            if (imagesInRow >= imagesPerRow) {
              imagesY += imgHeight + imgSpacing
              imagesInRow = 0
            }
          }
        }
        
        if (imagesInRow > 0) {
          imagesY += imgHeight + imgSpacing
        }
        
        const imagesSectionHeight = imagesY - imagesSectionY + 5
        drawBorderedBox(margin, imagesSectionY, contentWidth, imagesSectionHeight, 'Listing Images')
        yPosition = imagesY + 5
      }
      
      checkPageBreak(100)
      yPosition += sectionSpacing
      
      // Application Information Section with table
      const applicantSectionY = yPosition
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(30, 30, 30)
      
      const applicantTableStartY = yPosition + 8
      let applicantTableY = applicantTableStartY
      const appLabelWidth = 50
      const appValueWidth = contentWidth - appLabelWidth
      
      // Personal Information
      const nameHeight = addTableRow('Full Name', `${selectedFullApplication.surname} ${selectedFullApplication.given_name}`, margin, applicantTableY, appLabelWidth, appValueWidth)
      applicantTableY += nameHeight
      
      const emailHeight = addTableRow('Email', selectedFullApplication.email, margin, applicantTableY, appLabelWidth, appValueWidth)
      applicantTableY += emailHeight
      
      const mobileHeight = addTableRow('Mobile', selectedFullApplication.mobile_number, margin, applicantTableY, appLabelWidth, appValueWidth)
      applicantTableY += mobileHeight
      
      const addressHeight = addTableRow('Current Address', selectedFullApplication.current_address, margin, applicantTableY, appLabelWidth, appValueWidth, 14)
      applicantTableY += addressHeight
      
      if (selectedFullApplication.work_address) {
        const workAddrHeight = addTableRow('Work Address', selectedFullApplication.work_address, margin, applicantTableY, appLabelWidth, appValueWidth, 14)
        applicantTableY += workAddrHeight
      }
      
      if (selectedFullApplication.work_phone) {
        const workPhoneHeight = addTableRow('Work Phone', selectedFullApplication.work_phone, margin, applicantTableY, appLabelWidth, appValueWidth)
        applicantTableY += workPhoneHeight
      }
      
      if (selectedFullApplication.mobile_registered_name) {
        const mobileNameHeight = addTableRow('Mobile Registered Name', selectedFullApplication.mobile_registered_name, margin, applicantTableY, appLabelWidth, appValueWidth)
        applicantTableY += mobileNameHeight
      }
      
      // Identification Information
      applicantTableY += 3
      if (selectedFullApplication.nin_number) {
        const ninHeight = addTableRow('NIN Number', selectedFullApplication.nin_number, margin, applicantTableY, appLabelWidth, appValueWidth)
        applicantTableY += ninHeight
      }
      
      if (selectedFullApplication.card_number) {
        const cardHeight = addTableRow('Card Number', selectedFullApplication.card_number, margin, applicantTableY, appLabelWidth, appValueWidth)
        applicantTableY += cardHeight
      }
      
      if (selectedFullApplication.passport_number) {
        const passportHeight = addTableRow('Passport Number', selectedFullApplication.passport_number, margin, applicantTableY, appLabelWidth, appValueWidth)
        applicantTableY += passportHeight
      }
      
      // Employment Information
      if (selectedFullApplication.employer_name) {
        applicantTableY += 3
        const employerHeight = addTableRow('Employer', selectedFullApplication.employer_name, margin, applicantTableY, appLabelWidth, appValueWidth)
        applicantTableY += employerHeight
      }
      
      // Next of Kin
      applicantTableY += 3
      const nextOfKinHeight = addTableRow('Next of Kin', `${selectedFullApplication.next_of_kin_name} (${selectedFullApplication.next_of_kin_number})`, margin, applicantTableY, appLabelWidth, appValueWidth)
      applicantTableY += nextOfKinHeight
      
      // Status and Dates
      applicantTableY += 3
      const statusHeight = addTableRow('Status', selectedFullApplication.status.toUpperCase(), margin, applicantTableY, appLabelWidth, appValueWidth)
      applicantTableY += statusHeight
      
      const appliedHeight = addTableRow('Applied Date', new Date(selectedFullApplication.created_at).toLocaleDateString(), margin, applicantTableY, appLabelWidth, appValueWidth)
      applicantTableY += appliedHeight
      
      if (selectedFullApplication.updated_at) {
        const updatedHeight = addTableRow('Updated Date', new Date(selectedFullApplication.updated_at).toLocaleDateString(), margin, applicantTableY, appLabelWidth, appValueWidth)
        applicantTableY += updatedHeight
      }
      
      const applicantSectionHeight = applicantTableY - applicantSectionY + 10
      drawBorderedBox(margin, applicantSectionY, contentWidth, applicantSectionHeight, 'Applicant Information')
      yPosition = applicantTableY + 5
      
      checkPageBreak(100)
      yPosition += sectionSpacing
      
      // Application Documents Section with borders
      const documentsSectionY = yPosition
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(30, 30, 30)
      
      const documentsStartY = yPosition + 8
      let documentsY = documentsStartY
      
      const documents = [
        { label: 'National ID (Front)', url: selectedFullApplication.national_id_front_url },
        { label: 'National ID (Back)', url: selectedFullApplication.national_id_back_url },
        { label: 'Passport Photo', url: selectedFullApplication.passport_photo_url },
        { label: 'Passport Particulars', url: selectedFullApplication.passport_particulars_url },
        { label: 'Applicant Photo', url: selectedFullApplication.applicant_photo_url },
        { label: 'Employment Contract', url: selectedFullApplication.employment_contract_url },
      ]
      
      const docImgWidth = 60  // Reduced from 80
      const docImgHeight = 45  // Reduced from 60
      const docSpacing = 6
      
      for (const doc of documents) {
        // Always show document label, even if no URL
        checkPageBreak(docImgHeight + 20)
        
        // Document label with background
        pdf.setFillColor(250, 250, 250)
        pdf.rect(margin, documentsY, contentWidth, 6, 'F')
        pdf.setDrawColor(220, 220, 220)
        pdf.setLineWidth(0.2)
        pdf.rect(margin, documentsY, contentWidth, 6)
        
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(60, 60, 60)
        pdf.text(doc.label + ':', margin + 2, documentsY + 4.5)
        documentsY += 7
        
        if (doc.url) {
          // Use pre-signed URL if available, otherwise use original URL
          let imageUrl = imageUrls.get(doc.url)
          if (!imageUrl) {
            // If pre-signed URL not in map, try to get it or use original
            imageUrl = doc.url
            // Try to get pre-signed URL on the fly
            try {
              const presignedMap = await getPresignedUrls([doc.url])
              imageUrl = presignedMap.get(doc.url) || doc.url
            } catch (error) {
              console.error('Error getting pre-signed URL:', error)
              imageUrl = doc.url
            }
          }
          
          try {
            // Add timeout for image loading (15 seconds for PDF generation)
            const imgData = await Promise.race([
              loadImageAsDataURL(imageUrl),
              new Promise<string>((_, reject) => 
                setTimeout(() => reject(new Error('Image load timeout')), 15000)
              )
            ]) as string
            
            // Draw border around image
            pdf.setDrawColor(200, 200, 200)
            pdf.setLineWidth(0.3)
            pdf.rect(margin - 1, documentsY - 1, docImgWidth + 2, docImgHeight + 2)
            
            pdf.addImage(imgData, 'JPEG', margin, documentsY, docImgWidth, docImgHeight)
            documentsY += docImgHeight + docSpacing
          } catch (error) {
            console.error(`Error loading document ${doc.label}:`, error)
            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'italic')
            pdf.setTextColor(150, 150, 150)
            pdf.text(`[${doc.label} could not be loaded]`, margin + 2, documentsY + 3)
            documentsY += docImgHeight + docSpacing // Use same height as image would take
          }
        } else {
          // No URL provided
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'italic')
          pdf.setTextColor(150, 150, 150)
          pdf.text('[Not provided]', margin + 2, documentsY + 3)
          documentsY += 6
        }
      }
      
      const documentsSectionHeight = documentsY - documentsSectionY + 5
      drawBorderedBox(margin, documentsSectionY, contentWidth, documentsSectionHeight, 'Application Documents')
      yPosition = documentsY + 5
      
      // Generate filename
      const sanitizedName = `${selectedFullApplication.surname}-${selectedFullApplication.given_name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      const filename = `application-${sanitizedName}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please make sure jspdf is installed: npm install jspdf')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleApprove = (id: string) => {
    onApprove?.(id)
    if (selectedApplication?.id === id) {
      setSelectedApplication((prev) => (prev ? { ...prev, status: "approved" } : null))
    }
  }

  const handleReject = (id: string) => {
    // Call parent handler so the backend (Supabase) is updated
    onReject?.(id)

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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Complete application information and documents</DialogDescription>
          </DialogHeader>
          {selectedApplication && selectedFullApplication && (
            <div className="space-y-6">
              {/* Applicant Info Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedFullApplication.surname} {selectedFullApplication.given_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
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
                    <span>Applied: {new Date(selectedFullApplication.created_at).toLocaleDateString()}</span>
                    {selectedFullApplication.updated_at && (
                      <>
                        <span>•</span>
                        <span>Updated: {new Date(selectedFullApplication.updated_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Surname</Label>
                    <p className="text-sm font-medium">{selectedFullApplication.surname}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Given Name</Label>
                    <p className="text-sm font-medium">{selectedFullApplication.given_name}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Current Address</Label>
                    <p className="text-sm font-medium">{selectedFullApplication.current_address}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-base">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-sm font-medium">{selectedFullApplication.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <Label className="text-xs text-muted-foreground">Mobile Number</Label>
                      <p className="text-sm font-medium">{selectedFullApplication.mobile_number}</p>
                    </div>
                  </div>
                  {selectedFullApplication.work_phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <Label className="text-xs text-muted-foreground">Work Phone</Label>
                        <p className="text-sm font-medium">{selectedFullApplication.work_phone}</p>
                      </div>
                    </div>
                  )}
                  {selectedFullApplication.work_address && (
                    <div className="md:col-span-2">
                      <Label className="text-xs text-muted-foreground">Work Address</Label>
                      <p className="text-sm font-medium">{selectedFullApplication.work_address}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">Mobile Registered Name</Label>
                    <p className="text-sm font-medium">{selectedFullApplication.mobile_registered_name}</p>
                  </div>
                </div>
              </div>

              {/* Identification */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-base">Identification</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedFullApplication.nin_number && (
                    <div>
                      <Label className="text-xs text-muted-foreground">NIN Number</Label>
                      <p className="text-sm font-medium">{selectedFullApplication.nin_number}</p>
                    </div>
                  )}
                  {selectedFullApplication.card_number && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Card Number</Label>
                      <p className="text-sm font-medium">{selectedFullApplication.card_number}</p>
                    </div>
                  )}
                  {selectedFullApplication.passport_number && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Passport Number</Label>
                      <p className="text-sm font-medium">{selectedFullApplication.passport_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Employment Information */}
              {selectedFullApplication.employer_name && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold text-base">Employment Information</h4>
                  <div>
                    <Label className="text-xs text-muted-foreground">Employer Name</Label>
                    <p className="text-sm font-medium">{selectedFullApplication.employer_name}</p>
                  </div>
                </div>
              )}

              {/* Next of Kin */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-base">Next of Kin</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="text-sm font-medium">{selectedFullApplication.next_of_kin_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone Number</Label>
                    <p className="text-sm font-medium">{selectedFullApplication.next_of_kin_number}</p>
                  </div>
                </div>
              </div>

              {/* Property Info */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base">Property Applied For</h4>
                  {selectedFullApplication && listingDetails && (
                    <Button
                      onClick={handleDownloadPDF}
                      size="sm"
                      className="gap-2"
                      disabled={generatingPDF}
                    >
                      {generatingPDF ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileDown className="h-4 w-4" />
                          Download All as PDF
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {loadingListing ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : listingDetails ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Listing ID</Label>
                      <p className="text-sm font-medium">{listingDetails.id}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Title</Label>
                      <p className="text-sm font-medium">{listingDetails.title}</p>
                    </div>
                    {listingDetails.description && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <p className="text-sm text-muted-foreground mt-1">{listingDetails.description}</p>
                      </div>
                    )}
                    {listingDetails.images && listingDetails.images.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Listing Images</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {listingDetails.images.slice(0, 3).map((imgUrl, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                              <Image
                                src={listingImageUrls.get(imgUrl) || imgUrl}
                                alt={`Listing image ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                        {listingDetails.images.length > 3 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            +{listingDetails.images.length - 3} more images
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Listing information not available</p>
                )}
              </div>

              {/* Documents & Images */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-base">Documents & Images</h4>
                {loadingImages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedFullApplication.national_id_front_url && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">National ID (Front)</Label>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                          <Image
                            src={imageUrls.get(selectedFullApplication.national_id_front_url) || selectedFullApplication.national_id_front_url}
                            alt="National ID Front"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                    {selectedFullApplication.national_id_back_url && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">National ID (Back)</Label>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                          <Image
                            src={imageUrls.get(selectedFullApplication.national_id_back_url) || selectedFullApplication.national_id_back_url}
                            alt="National ID Back"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                    {selectedFullApplication.passport_photo_url && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Passport Photo</Label>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                          <Image
                            src={imageUrls.get(selectedFullApplication.passport_photo_url) || selectedFullApplication.passport_photo_url}
                            alt="Passport Photo"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                    {selectedFullApplication.passport_particulars_url && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Passport Particulars</Label>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                          <Image
                            src={imageUrls.get(selectedFullApplication.passport_particulars_url) || selectedFullApplication.passport_particulars_url}
                            alt="Passport Particulars"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                    {selectedFullApplication.applicant_photo_url && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Applicant Photo</Label>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                          <Image
                            src={imageUrls.get(selectedFullApplication.applicant_photo_url) || selectedFullApplication.applicant_photo_url}
                            alt="Applicant Photo"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                    {selectedFullApplication.employment_contract_url && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Employment Contract</Label>
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                          <FileImage className="h-12 w-12 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
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
