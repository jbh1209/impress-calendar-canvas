# Impress Calendars E-Commerce Platform - Product Requirements Document (PRD)

## 1. Project Overview

**Project Name:** Impress Calendars E-Commerce Platform  
**Last Updated:** May 2, 2025  
**Version:** 1.0

### 1.1 Project Description

Impress Calendars is an e-commerce platform that allows users to browse, customize, and purchase high-quality calendars. The platform offers various calendar designs, customization options including integration with Shutterstock's image library, secure checkout, and user account management.

### 1.2 Project Objectives

- Create a full-featured e-commerce platform for selling customizable calendars
- Implement Shutterstock API integration for premium image selection
- Provide an intuitive calendar customization experience
- Establish secure user authentication and profile management
- Enable smooth order processing and management
- Deliver responsive design for all device types

## 2. Database Requirements

### 2.1 Product Catalog

- **products**: Store calendar products with attributes (id, name, description, base_price, dimensions, category, tags, thumbnail_url, created_at, updated_at)
- **product_variants**: Store variations of products (id, product_id, name, price_adjustment, stock_quantity, sku, created_at, updated_at)
- **categories**: Organize products by category (id, name, description, parent_id, created_at, updated_at)
- **product_images**: Store product gallery images (id, product_id, image_url, alt_text, display_order, created_at, updated_at)

### 2.2 Orders System

- **carts**: Store shopping cart data (id, user_id, created_at, updated_at)
- **cart_items**: Store items in cart (id, cart_id, product_variant_id, quantity, customization_data, shutterstock_images, created_at, updated_at)
- **orders**: Store order information (id, user_id, status, subtotal, tax, shipping_cost, discount_amount, total, payment_merchant_id, payment_reference, shipping_address_id, billing_address_id, created_at, updated_at)
- **order_items**: Store items in orders (id, order_id, product_variant_id, price_at_checkout, quantity, customization_data, shutterstock_images, created_at)
- **addresses**: Store shipping and billing addresses (id, user_id, type, name, address_line1, address_line2, city, state, postal_code, country, phone, is_default, created_at, updated_at)
- **payment_transactions**: Store payment transaction details (id, order_id, payment_merchant_id, payment_id, amount, status, currency, payment_method, created_at, updated_at)

### 2.3 User Data

- **profiles**: Store user profile information (id, username, full_name, avatar_url, email_preferences, created_at, updated_at)
- **wishlists**: Store user wishlists (id, user_id, name, created_at, updated_at)
- **wishlist_items**: Store items in wishlists (id, wishlist_id, product_id, added_at)
- **reviews**: Store product reviews (id, product_id, user_id, rating, title, content, created_at, updated_at)

### 2.4 Design & Customization

- **calendar_designs**: Store user calendar designs (id, user_id, name, product_id, customization_data, preview_image_url, is_saved, created_at, updated_at)
- **shutterstock_selections**: Track selected Shutterstock images (id, user_id, image_id, thumbnail_url, preview_url, created_at, updated_at)
- **shutterstock_licenses**: Store license information for purchased images (id, user_id, image_id, license_type, license_id, download_url, purchased_at, expires_at, price, order_id)

## 3. Frontend Requirements

### 3.1 Product Browsing

- Homepage with featured products and categories
- Product listing pages with filtering and sorting options
- Product detail pages with gallery, pricing, variants, and "Add to Cart" functionality
- Search functionality with autocomplete
- Category navigation

### 3.2 Shopping Experience

- Shopping cart with item management
- Checkout process with shipping options, address input, and PayFast payment integration
- Order confirmation page
- Order history and tracking

### 3.3 User Account Features

- User registration and login
- Profile management
- Address book management
- Order history and status
- Wishlist functionality
- Saved calendar designs

### 3.4 Customization Tools

- Calendar customization interface
- Drag-and-drop image placement
- Text editing tools for adding custom text
- Date marking and event management
- Preview generation

### 3.5 Shutterstock Integration UI

- Search interface for Shutterstock images
- Text search field with autocomplete
- Category and filter options (orientation, color themes, etc.)
- Search results display with pagination
- Image preview and selection interface
- Placement interface for adding images to calendar designs
- Image positioning and resizing controls
- License status indicators

## 4. Backend Requirements

### 4.1 Authentication

- User registration, login, and password reset
- Social authentication options
- Session management
- Access control for protected routes

### 4.2 Order Processing

- Cart management
- Tax calculation
- Shipping cost calculation
- PayFast payment processing integration
- Order status management
- Confirmation emails
- Invoice generation

### 4.3 Inventory & Product Management

- Stock tracking
- Low stock alerts
- Product information management
- Product image management

### 4.4 Admin Dashboard

- Product management
- Order management
- User management
- Inventory management
- Analytics and reporting

### 4.5 Shutterstock API Management

- Secure API credential storage
- Edge functions for API communication
- Search query processing
- Image preview fetching
- License purchasing and tracking
- Usage monitoring and optimization
- Error handling and fallbacks

## 5. Integration Requirements

### 5.1 Payment Processing

- Integration with PayFast payment gateway
- Support for multiple payment methods through PayFast (credit cards, instant EFT, Mobicred, etc.)
- Secure payment processing using PayFast's security features
- Payment verification and ITN (Instant Transaction Notification) handling
- Refund processing through PayFast admin interface

### 5.2 Shipping

- Integration with shipping carriers for rate calculation
- Shipping label generation
- Order tracking

### 5.3 Email Communications

- Order confirmations
- Shipping notifications
- Password resets
- Marketing emails (promotional content, abandoned cart)

### 5.4 Shutterstock API

- **Authentication**: Secure storage of API credentials
- **Search Functionality**: Search endpoint integration with filters
- **Image Preview**: Fetching and displaying preview images
- **Licensing**: Purchasing and downloading licensed images
- **Usage Tracking**: Monitoring API usage and costs

### 5.5 PayFast API Integration Details

#### 5.5.1 Setup and Configuration
- Register for PayFast merchant account
- Obtain and securely store Merchant ID, Merchant Key, and Passphrase in Supabase
- Configure PayFast sandbox environment for testing
- Set up secure callback URLs for payment notifications (ITN)

#### 5.5.2 Payment Flow
- Implement redirect-based payment flow
- Generate secure payment requests with proper signature
- Handle payment return URLs (success, cancel, notify)
- Process and verify Instant Transaction Notifications
- Provide order status updates based on payment verification

#### 5.5.3 Security Implementation
- Implement signature generation and validation
- Validate ITN messages using server-side processing
- Perform security checks (amount validation, duplicate payment detection)
- Use HTTPS for all payment-related communication
- Implement PayFast's security recommendations

#### 5.5.4 Testing & Monitoring
- Test payments using PayFast sandbox environment
- Implement payment logging and monitoring
- Test edge cases (failed payments, disputed transactions)
- Implement payment status tracking and recovery procedures
- Monitor transaction fees and reconciliation

## 6. Technical Requirements

### 6.1 Performance

- Page load time < 2 seconds
- Responsive design for all screen sizes
- Image optimization for fast loading
- API response time < 500ms

### 6.2 Security

- HTTPS implementation
- Secure storage of user data
- PCI compliance through PayFast's secure payment handling
- GDPR compliance for user data
- Rate limiting for API endpoints
- Protection against common web vulnerabilities (XSS, CSRF, etc.)
- Secure communication with PayFast API using valid signatures

### 6.3 Reliability

- 99.9% uptime
- Automated backups
- Error logging and monitoring
- Graceful error handling

## 7. Implementation Plan

### Phase 1: Foundation (4-6 weeks)
- Set up database schema for products, categories, and users
- Create product browsing and detail pages
- Implement basic user authentication
- Develop shopping cart functionality
- Setup admin dashboard foundation

### Phase 2: E-Commerce Functionality (4-6 weeks)
- Implement checkout process
- Integrate PayFast payment processing
- Set up order management system
- Create user account features
- Implement inventory management
- Set up email notifications
- Implement payment notification handling and verification

### Phase 3: Customization Tools (4-6 weeks)
- Develop calendar customization interface
- Create image upload and management
- Implement text editing tools
- Develop design saving functionality
- Create preview generation system

### Phase 4: Shutterstock Integration (4-6 weeks)
- Set up Shutterstock API authentication
- Implement search interface
- Create image preview and selection functionality
- Develop image placement tools
- Implement licensing process
- Set up usage monitoring

### Phase 5: Optimization and Launch (2-4 weeks)
- Perform performance optimization
- Conduct security testing
- Implement analytics
- Perform user acceptance testing
- Prepare marketing materials
- Launch platform

## 8. Success Metrics

- User acquisition: 1,000+ registered users in first 3 months
- Conversion rate: >2% of visitors complete purchase
- Average order value: >$25
- Customization rate: >60% of orders include customization
- Shutterstock usage: >30% of customized orders include Shutterstock images
- Customer satisfaction: >4.5/5 star average rating

## 9. Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Authentication, Database, Storage)
- **Database**: PostgreSQL (via Supabase)
- **API**: RESTful API endpoints with Supabase edge functions
- **Payment**: PayFast integration with secure ITN handling
- **Image Processing**: Canvas API for client-side image manipulation
- **External APIs**: Shutterstock API for image library

## 10. Shutterstock API Integration Details

### 10.1 Setup and Configuration
- Register for Shutterstock developer account
- Obtain and securely store API credentials in Supabase
- Create API wrapper functions for all Shutterstock endpoints
- Implement error handling and retry logic

### 10.2 Search Functionality
- Text-based image search with autocomplete
- Category-based browsing
- Advanced filtering options (orientation, color, category, style)
- Result pagination and sorting
- Search history tracking

### 10.3 Image Preview & Selection
- Thumbnail display with lazy loading
- Image detail view with metadata
- Temporary collections for selected images
- Preview watermarking indication
- Design canvas integration

### 10.4 Licensing & Checkout
- License type selection (standard, enhanced)
- License cost calculation and inclusion in order total
- License purchase at checkout
- High-resolution image download and storage
- License management and tracking

### 10.5 Testing & Optimization
- Integration testing across the entire flow
- API usage monitoring and optimization
- Cache implementation for frequent searches
- Performance benchmarking
- Fallback mechanisms for API downtime

## 11. Current Implementation Status

As of May 2025, the following components have been implemented:

### Completed Features:
- Basic project structure with React, TypeScript, and Tailwind CSS
- Authentication system with login/signup capabilities
- Shutterstock image search and browsing functionality
- Image selection and saving to user's collection
- User profile management
- Responsive UI design for all device sizes

### In Progress:
- Calendar customization interface
- PayFast payment processing integration
- Order management system
- Admin dashboard

### Pending:
- Product catalog management
- Wishlist functionality
- Email notification system
- Advanced analytics
