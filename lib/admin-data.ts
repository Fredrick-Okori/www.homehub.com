// Types for the Admin Dashboard
export interface Property {
  id: string
  title: string
  price: number
  location: string
  beds: number
  baths: number
  area: number
  image: string
  description: string
  type: "Buy" | "Rent"
  status: "active" | "pending" | "sold" | "rented"
  createdAt: string
  updatedAt: string
}

export interface Application {
  id: string
  listingId: string
  listingTitle: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  status: "pending" | "approved" | "rejected"
  message: string
  appliedAt: string
}

export interface DashboardStats {
  totalListings: number
  activeListings: number
  totalApplications: number
  pendingApplications: number
  totalViews: number
  revenue: number
}

// Mock Data
export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Modern Downtown Loft",
    price: 450000,
    location: "Kampala, Uganda",
    beds: 3,
    baths: 2,
    area: 1800,
    image: "/modern-downtown-loft-apartment-urban.jpg",
    description: "Stunning modern loft in the heart of downtown with city views",
    type: "Buy",
    status: "active",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Beachfront Luxury Condo",
    price: 850000,
    location: "Entebbe, Uganda",
    beds: 4,
    baths: 3,
    area: 2500,
    image: "/beachfront-luxury-condo-with-ocean-view.jpg",
    description: "Luxurious beachfront condo with stunning ocean views",
    type: "Buy",
    status: "active",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-12",
  },
  {
    id: "3",
    title: "Contemporary Urban Townhouse",
    price: 320000,
    location: "Nairobi, Kenya",
    beds: 3,
    baths: 2.5,
    area: 2100,
    image: "/contemporary-urban-townhouse-modern-design.jpg",
    description: "Modern townhouse with sleek design and premium finishes",
    type: "Buy",
    status: "pending",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
  },
  {
    id: "4",
    title: "Luxury Mountain Cabin",
    price: 580000,
    location: "Rwanda",
    beds: 5,
    baths: 4,
    area: 3200,
    image: "/luxury-mountain-cabin-home-snow-ski.jpg",
    description: "Stunning mountain cabin perfect for ski enthusiasts",
    type: "Buy",
    status: "active",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-18",
  },
  {
    id: "5",
    title: "Suburban Family Home",
    price: 275000,
    location: "Jinja, Uganda",
    beds: 4,
    baths: 3,
    area: 2400,
    image: "/suburban-family-home-with-large-yard-trees.jpg",
    description: "Spacious family home with large yard and modern amenities",
    type: "Buy",
    status: "sold",
    createdAt: "2023-12-15",
    updatedAt: "2024-01-25",
  },
]

export const mockApplications: Application[] = [
  {
    id: "1",
    listingId: "1",
    listingTitle: "Modern Downtown Loft",
    applicantName: "John Smith",
    applicantEmail: "john.smith@email.com",
    applicantPhone: "+256 701 234 567",
    status: "pending",
    message: "I'm very interested in this property and would like to schedule a viewing.",
    appliedAt: "2024-01-22",
  },
  {
    id: "2",
    listingId: "2",
    listingTitle: "Beachfront Luxury Condo",
    applicantName: "Sarah Johnson",
    applicantEmail: "sarah.j@email.com",
    applicantPhone: "+256 772 345 678",
    status: "approved",
    message: "Looking for a vacation home. This property is perfect for my family.",
    appliedAt: "2024-01-18",
  },
  {
    id: "3",
    listingId: "4",
    listingTitle: "Luxury Mountain Cabin",
    applicantName: "Michael Brown",
    applicantEmail: "m.brown@email.com",
    applicantPhone: "+256 783 456 789",
    status: "pending",
    message: "Interested in investment property. Is this still available?",
    appliedAt: "2024-01-24",
  },
  {
    id: "4",
    listingId: "1",
    listingTitle: "Modern Downtown Loft",
    applicantName: "Emily Davis",
    applicantEmail: "emily.d@email.com",
    applicantPhone: "+256 794 567 890",
    status: "rejected",
    message: "Looking for something closer to the city center.",
    appliedAt: "2024-01-16",
  },
]

export const mockDashboardStats: DashboardStats = {
  totalListings: 156,
  activeListings: 89,
  totalApplications: 234,
  pendingApplications: 45,
  totalViews: 15678,
  revenue: 2450000,
}

