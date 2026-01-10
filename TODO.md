# Dashboard Layout Setup

## Status: Complete

Removed all `useAuth` and `admin-auth-context` dependencies from dashboard layout to allow building the UI first.

## Changes Made

- [x] Updated `app/(dashboard)/admin/layout.tsx` - Removed `useAuth` import and `AdminAuthProvider`
- [x] Updated `app/(admin-auth)/admin/layout.tsx` - Simplified to pass through children
- [x] Updated `app/admin/layout.tsx` - Simplified to pass through children
- [x] Updated `components/admin-header.tsx` - Removed `useAuth` import, using static "Admin" user

## To Implement Later

- Admin authentication context
- Login page functionality
- Protected routes
- User session management

