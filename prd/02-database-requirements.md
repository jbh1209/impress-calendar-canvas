
# 2. Database Requirements

## 2.1 Product Catalog

- **products**: Store calendar products with attributes (id, name, description, base_price, dimensions, category, tags, thumbnail_url, created_at, updated_at)
- **product_variants**: Store variations of products (id, product_id, name, price_adjustment, stock_quantity, sku, created_at, updated_at)
- **categories**: Organize products by category (id, name, description, parent_id, created_at, updated_at)
- **product_images**: Store product gallery images (id, product_id, image_url, alt_text, display_order, created_at, updated_at)

## 2.2 Orders System

- **carts**: Store shopping cart data (id, user_id, created_at, updated_at)
- **cart_items**: Store items in cart (id, cart_id, product_variant_id, quantity, customization_data, shutterstock_images, created_at, updated_at)
- **orders**: Store order information (id, user_id, status, subtotal, tax, shipping_cost, discount_amount, total, payment_merchant_id, payment_reference, shipping_address_id, billing_address_id, created_at, updated_at)
- **order_items**: Store items in orders (id, order_id, product_variant_id, price_at_checkout, quantity, customization_data, shutterstock_images, created_at)
- **addresses**: Store shipping and billing addresses (id, user_id, type, name, address_line1, address_line2, city, state, postal_code, country, phone, is_default, created_at, updated_at)
- **payment_transactions**: Store payment transaction details (id, order_id, payment_merchant_id, payment_id, amount, status, currency, payment_method, created_at, updated_at)

## 2.3 User Data

- **profiles**: Store user profile information (id, username, full_name, avatar_url, email_preferences, created_at, updated_at)
- **wishlists**: Store user wishlists (id, user_id, name, created_at, updated_at)
- **wishlist_items**: Store items in wishlists (id, wishlist_id, product_id, added_at)
- **reviews**: Store product reviews (id, product_id, user_id, rating, title, content, created_at, updated_at)

## 2.4 Design & Customization

- **calendar_designs**: Store user calendar designs (id, user_id, name, product_id, customization_data, preview_image_url, is_saved, created_at, updated_at)
- **shutterstock_selections**: Track selected Shutterstock images (id, user_id, image_id, thumbnail_url, preview_url, created_at, updated_at)
- **shutterstock_licenses**: Store license information for purchased images (id, user_id, image_id, license_type, license_id, download_url, purchased_at, expires_at, price, order_id)
- **templates**: Store template designs (id, name, description, base_pdf_url, category_id, is_active, dimensions, created_at, updated_at)
- **template_pages**: Store individual pages of a template PDF (id, template_id, page_number, preview_image_url, created_at, updated_at)
- **customization_zones**: Store definitions for customizable zones (id, template_id, name, type, default_x, default_y, default_width, default_height, created_at, updated_at)
- **zone_page_assignments**: Links zones to specific pages and defines their properties for that page (id, zone_id, page_id, x, y, width, height, z_index, is_repeating)
- **user_customizations**: Stores user-specific content for each zone in a design (id, design_id, zone_assignment_id, content_type, content_value, shutterstock_image_id)
