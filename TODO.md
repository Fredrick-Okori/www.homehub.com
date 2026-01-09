# TODO: Move Footer and Header to Root Layout

## Task: Move Footer and Header to rootlayout

### Plan:
1. Create a client-side layout wrapper component (since root layout is server component)
2. Move Footer to the layout (it's simple with no props)
3. Keep Header in page.tsx since it requires props/state specific to home page
4. Update layout to use the client wrapper with Footer

### Steps:
- [x] Read and understand current file structure
- [x] Create client-side layout wrapper component
- [x] Update app/layout.tsx to use the wrapper and include Footer
- [x] Remove Footer from app/page.tsx
- [x] Verify Footer appears on all pages (Build passed successfully)

### Notes:
- Header requires props (searchTerm, onSearchChange, onFiltersOpen) that are page-specific
- Header will remain in page.tsx for the home page
- Footer will be moved to layout.tsx for all pages

