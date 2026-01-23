"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, CheckCircle, Upload, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ApplicationModalProps {
  isOpen: boolean
  listingId: string | null
  listings: Array<{ id: string; title: string; uuid?: string }> // id is now the UUID string
  onClose: () => void
}

// Zod schema for form validation
const applicationFormSchema = z.object({
  surname: z.string().min(1, "Surname is required"),
  givenName: z.string().min(1, "Given name is required"),
  currentAddress: z.string().min(1, "Current address is required"),
  workAddress: z.string().optional(),
  workPhone: z.string().optional(),
  email: z.string().email("Invalid email address"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  mobileRegisteredName: z.string().min(1, "Name mobile is registered in is required"),
  ninNumber: z.string().optional(),
  cardNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  employerName: z.string().optional(),
  nextOfKinName: z.string().min(1, "Next of kin name is required"),
  nextOfKinNumber: z.string().min(1, "Next of kin number is required"),
})

type ApplicationFormValues = z.infer<typeof applicationFormSchema>

export function ApplicationModal({ isOpen, listingId, listings, onClose }: ApplicationModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [submitted, setSubmitted] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // File states
  const [nationalIdFront, setNationalIdFront] = useState<File | null>(null)
  const [nationalIdBack, setNationalIdBack] = useState<File | null>(null)
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null)
  const [passportParticulars, setPassportParticulars] = useState<File | null>(null)
  const [applicantPhoto, setApplicantPhoto] = useState<File | null>(null)
  const [employmentContract, setEmploymentContract] = useState<File | null>(null)

  const listing = listings.find((l) => l.id === listingId)

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      surname: "",
      givenName: "",
      currentAddress: "",
      workAddress: "",
      workPhone: "",
      email: "",
      mobileNumber: "",
      mobileRegisteredName: "",
      ninNumber: "",
      cardNumber: "",
      passportNumber: "",
      employerName: "",
      nextOfKinName: "",
      nextOfKinNumber: "",
    },
  })

  // File upload handler
  const uploadFile = async (file: File, folder: string, subfolder?: string): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Build query string with folder and optional subfolder
      const params = new URLSearchParams()
      params.append('folder', folder)
      if (subfolder) {
        params.append('subfolder', subfolder)
      }

      const response = await fetch(`/api/upload?${params.toString()}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      return data.url
    } catch (error: any) {
      console.error(`Error uploading ${folder}:`, error)
      toast.error(`Failed to upload ${folder}`)
      return null
    }
  }

  // Helper function to create sanitized folder name from applicant names
  // Format: {surname}-{givenname} (surname first, then given name)
  const createApplicantFolderName = (surname: string, givenName: string): string => {
    // Trim whitespace from both names
    const cleanSurname = surname.trim()
    const cleanGivenName = givenName.trim()
    
    // Combine as: surname-givenname (surname first, then given name)
    const combined = `${cleanSurname}-${cleanGivenName}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric (except hyphens) with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    
    return combined
  }

  const handleSubmit = async (data: ApplicationFormValues) => {
    if (!listingId) {
      toast.error('Invalid listing ID')
      return
    }

    try {
      setUploading(true)

      // Create applicant folder name from surname and given name (surname-first, then given name)
      // This ensures all files for this application go into the same folder
      const applicantFolderName = createApplicantFolderName(data.surname, data.givenName)
      
      console.log('Applicant folder name:', applicantFolderName, 'from:', { surname: data.surname, givenName: data.givenName })

      // Upload all files to applications/{surname-givenname}/
      // All files for this application will be in: applications/{applicantFolderName}/
      const uploadPromises: Promise<string | null>[] = []
      
      if (nationalIdFront) uploadPromises.push(uploadFile(nationalIdFront, 'applications', applicantFolderName))
      if (nationalIdBack) uploadPromises.push(uploadFile(nationalIdBack, 'applications', applicantFolderName))
      if (passportPhoto) uploadPromises.push(uploadFile(passportPhoto, 'applications', applicantFolderName))
      if (passportParticulars) uploadPromises.push(uploadFile(passportParticulars, 'applications', applicantFolderName))
      if (applicantPhoto) uploadPromises.push(uploadFile(applicantPhoto, 'applications', applicantFolderName))
      if (employmentContract) uploadPromises.push(uploadFile(employmentContract, 'applications', applicantFolderName))

      const uploadedUrls = await Promise.all(uploadPromises)
      
      // Extract URLs, defaulting to null if not uploaded
      // The order matches: national-id-front, national-id-back, passport-photo, 
      // passport-particulars, applicant-photo, employment-contract
      let nationalIdFrontUrl: string | null = null
      let nationalIdBackUrl: string | null = null
      let passportPhotoUrl: string | null = null
      let passportParticularsUrl: string | null = null
      let applicantPhotoUrl: string | null = null
      let employmentContractUrl: string | null = null
      
      let urlIndex = 0
      if (nationalIdFront) {
        nationalIdFrontUrl = uploadedUrls[urlIndex] || null
        urlIndex++
      }
      if (nationalIdBack) {
        nationalIdBackUrl = uploadedUrls[urlIndex] || null
        urlIndex++
      }
      if (passportPhoto) {
        passportPhotoUrl = uploadedUrls[urlIndex] || null
        urlIndex++
      }
      if (passportParticulars) {
        passportParticularsUrl = uploadedUrls[urlIndex] || null
        urlIndex++
      }
      if (applicantPhoto) {
        applicantPhotoUrl = uploadedUrls[urlIndex] || null
        urlIndex++
      }
      if (employmentContract) {
        employmentContractUrl = uploadedUrls[urlIndex] || null
        urlIndex++
      }

      // Get the listing (listingId is now the UUID string)
      const listing = listings.find((l) => l.id === listingId)
      if (!listing) {
        toast.error('Listing not found')
        return
      }

      // Use listingId directly as it's now the UUID string
      const listingUuid: string = listingId

      // Prepare application data
      const applicationData = {
        listing_id: listingUuid,
        surname: data.surname,
        given_name: data.givenName,
        current_address: data.currentAddress,
        work_address: data.workAddress || null,
        work_phone: data.workPhone || null,
        email: data.email,
        mobile_number: data.mobileNumber,
        mobile_registered_name: data.mobileRegisteredName,
        nin_number: data.ninNumber || null,
        card_number: data.cardNumber || null,
        passport_number: data.passportNumber || null,
        national_id_front_url: nationalIdFrontUrl,
        national_id_back_url: nationalIdBackUrl,
        passport_photo_url: passportPhotoUrl,
        passport_particulars_url: passportParticularsUrl,
        applicant_photo_url: applicantPhotoUrl,
        employment_contract_url: employmentContractUrl,
        employer_name: data.employerName || null,
        next_of_kin_name: data.nextOfKinName,
        next_of_kin_number: data.nextOfKinNumber,
        status: 'pending',
      }

      // Save to Supabase
      const { data: insertData, error: insertError } = await supabase
        .from('applications')
        .insert(applicationData)
        .select()

      if (insertError) {
        // Log detailed error information
        console.error('Error saving application:', JSON.stringify({
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        }, null, 2))
        console.error('Application data being inserted:', JSON.stringify(applicationData, null, 2))
        
        // Show user-friendly error message
        const errorMessage = insertError.message || 'Unknown error'
        const errorHint = insertError.hint ? `\nHint: ${insertError.hint}` : ''
        toast.error(`Failed to submit application: ${errorMessage}${errorHint}`)
        return
      }

      console.log('Application saved successfully:', insertData)

      setSubmitted(true)
      toast.success('Application submitted successfully!')
      
      setTimeout(() => {
        form.reset()
        setNationalIdFront(null)
        setNationalIdBack(null)
        setPassportPhoto(null)
        setPassportParticulars(null)
        setApplicantPhoto(null)
        setEmploymentContract(null)
        setSubmitted(false)
        onClose()
      }, 3000)
    } catch (error: any) {
      console.error('Error submitting application:', error)
      toast.error(error.message || 'Failed to submit application')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!submitted && !uploading) {
      form.reset()
      setNationalIdFront(null)
      setNationalIdBack(null)
      setPassportPhoto(null)
      setPassportParticulars(null)
      setApplicantPhoto(null)
      setEmploymentContract(null)
      onClose()
    }
  }

  if (!isOpen || !listing) return null

  // File input component
  const FileInput = ({ 
    label, 
    file, 
    setFile, 
    accept = "image/*" 
  }: { 
    label: string
    file: File | null
    setFile: (file: File | null) => void
    accept?: string
  }) => (
    <div>
      <Label className="text-xs sm:text-sm font-semibold text-foreground">{label}</Label>
      <div className="mt-2">
        <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-3 pb-4 sm:pt-5 sm:pb-6 px-2">
            {file ? (
              <>
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-primary" />
                <p className="text-xs sm:text-sm text-foreground font-medium text-center truncate w-full px-2">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground text-center">Click to upload</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile) {
                if (selectedFile.size > 10 * 1024 * 1024) {
                  toast.error('File size must be less than 10MB')
                  return
                }
                setFile(selectedFile)
              }
            }}
          />
        </label>
        {file && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setFile(null)}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto p-2 sm:p-4">
      <Card className="mt-4 sm:mt-8 w-full max-w-4xl mx-auto shadow-xl animate-in zoom-in-95 fade-in-0 slide-in-from-bottom-4 duration-300 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative p-4 sm:p-6">
          <button
            onClick={handleClose}
            disabled={submitted || uploading}
            className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-full p-1 hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </button>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground pr-8">Apply Now</CardTitle>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">{listing.title}</p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {!submitted ? (
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
              {/* Personal Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground border-b pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="surname" className="text-xs sm:text-sm font-semibold text-foreground">
                      Surname <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="surname"
                      {...form.register("surname")}
                      className="mt-2 text-sm"
                      placeholder="Enter your surname"
                    />
                    {form.formState.errors.surname && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{form.formState.errors.surname.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="givenName" className="text-xs sm:text-sm font-semibold text-foreground">
                      Given Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="givenName"
                      {...form.register("givenName")}
                      className="mt-2 text-sm"
                      placeholder="Enter your given name"
                    />
                    {form.formState.errors.givenName && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{form.formState.errors.givenName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="currentAddress" className="text-xs sm:text-sm font-semibold text-foreground">
                    Current Physical Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="currentAddress"
                    {...form.register("currentAddress")}
                    className="mt-2 text-sm"
                    placeholder="Enter your current physical address"
                    rows={3}
                  />
                  {form.formState.errors.currentAddress && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{form.formState.errors.currentAddress.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground border-b pb-2">Contact Information</h3>
                
                <div>
                  <Label htmlFor="workAddress" className="text-xs sm:text-sm font-semibold text-foreground">
                    Work Address
                  </Label>
                  <Textarea
                    id="workAddress"
                    {...form.register("workAddress")}
                    className="mt-2 text-sm"
                    placeholder="Enter your work address"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="workPhone" className="text-xs sm:text-sm font-semibold text-foreground">
                      Work Phone Number
                    </Label>
                    <Input
                      id="workPhone"
                      {...form.register("workPhone")}
                      className="mt-2 text-sm"
                      placeholder="Enter work phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-foreground">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="mt-2 text-sm"
                      placeholder="Enter email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="mobileNumber" className="text-xs sm:text-sm font-semibold text-foreground">
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="mobileNumber"
                      {...form.register("mobileNumber")}
                      className="mt-2 text-sm"
                      placeholder="Enter mobile number"
                    />
                    {form.formState.errors.mobileNumber && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{form.formState.errors.mobileNumber.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="mobileRegisteredName" className="text-xs sm:text-sm font-semibold text-foreground">
                    Name Mobile Number is Registered In <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobileRegisteredName"
                    {...form.register("mobileRegisteredName")}
                    className="mt-2 text-sm"
                    placeholder="Enter the name the mobile number is registered in"
                  />
                  {form.formState.errors.mobileRegisteredName && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{form.formState.errors.mobileRegisteredName.message}</p>
                  )}
                </div>
              </div>

              {/* Identification */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground border-b pb-2">Identification</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="ninNumber" className="text-xs sm:text-sm font-semibold text-foreground">
                      NIN Number
                    </Label>
                    <Input
                      id="ninNumber"
                      {...form.register("ninNumber")}
                      className="mt-2 text-sm"
                      placeholder="Enter NIN number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-xs sm:text-sm font-semibold text-foreground">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      {...form.register("cardNumber")}
                      className="mt-2 text-sm"
                      placeholder="Enter card number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passportNumber" className="text-xs sm:text-sm font-semibold text-foreground">
                      Passport Number
                    </Label>
                    <Input
                      id="passportNumber"
                      {...form.register("passportNumber")}
                      className="mt-2 text-sm"
                      placeholder="Enter passport number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FileInput
                    label="National ID - Front Side"
                    file={nationalIdFront}
                    setFile={setNationalIdFront}
                  />
                  <FileInput
                    label="National ID - Back Side"
                    file={nationalIdBack}
                    setFile={setNationalIdBack}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FileInput
                    label="Passport Photo"
                    file={passportPhoto}
                    setFile={setPassportPhoto}
                  />
                  <FileInput
                    label="Passport Particulars Page"
                    file={passportParticulars}
                    setFile={setPassportParticulars}
                  />
                </div>

                <FileInput
                  label="Applicant Photo"
                  file={applicantPhoto}
                  setFile={setApplicantPhoto}
                />
              </div>

              {/* Employment Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground border-b pb-2">Employment Information</h3>
                
                <div>
                  <Label htmlFor="employerName" className="text-xs sm:text-sm font-semibold text-foreground">
                    Employer Name
                  </Label>
                    <Input
                      id="employerName"
                      {...form.register("employerName")}
                      className="mt-2 text-sm"
                      placeholder="Enter employer name"
                    />
                </div>

                <FileInput
                  label="Employment Contract (if available)"
                  file={employmentContract}
                  setFile={setEmploymentContract}
                />
              </div>

              {/* Next of Kin */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground border-b pb-2">Next of Kin</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="nextOfKinName" className="text-xs sm:text-sm font-semibold text-foreground">
                      Next of Kin Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nextOfKinName"
                      {...form.register("nextOfKinName")}
                      className="mt-2 text-sm"
                      placeholder="Enter next of kin name"
                    />
                    {form.formState.errors.nextOfKinName && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{form.formState.errors.nextOfKinName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nextOfKinNumber" className="text-xs sm:text-sm font-semibold text-foreground">
                      Next of Kin Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nextOfKinNumber"
                      {...form.register("nextOfKinNumber")}
                      className="mt-2 text-sm"
                      placeholder="Enter next of kin number"
                    />
                    {form.formState.errors.nextOfKinNumber && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{form.formState.errors.nextOfKinNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 sm:h-11 text-sm sm:text-base transition-all duration-200 active:scale-95"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          ) : (
            <div className="py-8 text-center animate-in fade-in duration-300">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 animate-in scale-in-95 duration-300">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Application Submitted!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your application has been received. We{"'"}ll contact you soon about this property.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
