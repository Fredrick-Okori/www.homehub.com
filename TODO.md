# Task: Make Airbnb-format search icon responsive

## Understanding
- Current header has a search bar with rounded-full styling
- Airbnb-style search typically features a pill-shaped search button with magnifying glass
- Need to make it responsive: icon-only on mobile, expandable pill on desktop

## Plan

### Phase 1: Header Updates ✅ COMPLETED
1. **Transform search bar to Airbnb-style expandable button** ✅
   - Create pill-shaped search button with magnifying glass icon ✅
   - On desktop: Expand to full search bar when clicked ✅
   - On mobile: Show as icon-only button that opens search modal/drawer ✅

2. **Responsive breakpoints** ✅
   - Mobile (< sm): Icon-only search button with "Search..." text, opens overlay
   - Tablet/Desktop (sm+): Expandable pill-shaped search bar

3. **Maintain current functionality** ✅
   - Keep MapPin icon for location input ✅
   - Keep search term state management ✅
   - Keep filters integration ✅

### Phase 2: Implementation Files
- `components/header.tsx` - Main header component with search ✅ COMPLETED

### Phase 3: Testing
- Verify responsive behavior at all breakpoints - MANUAL TESTING NEEDED
- Ensure search functionality works correctly - MANUAL TESTING NEEDED
- Test animations and transitions - Uses framer-motion ✅

## Dependencies
- No new dependencies needed
- Uses existing UI components and framer-motion (from hero-section) ✅

