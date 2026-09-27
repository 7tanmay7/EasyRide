-- EasyRide Master Database Schema (PostgreSQL + PostGIS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'DRIVER', 'BUSINESS', 'ADMIN')),
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Driver Profiles
CREATE TABLE IF NOT EXISTS driver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'IN_TRIP', 'BUSY')),
    rating NUMERIC(3, 2) DEFAULT 4.85,
    acceptance_rate NUMERIC(5, 2) DEFAULT 95.0,
    cancellation_rate NUMERIC(5, 2) DEFAULT 2.0,
    total_trips INTEGER DEFAULT 0,
    total_earnings NUMERIC(10, 2) DEFAULT 0.0,
    current_location GEOGRAPHY(Point, 4326),
    heading NUMERIC(5, 2) DEFAULT 0,
    speed NUMERIC(5, 2) DEFAULT 0,
    last_location_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_driver_profiles_location ON driver_profiles USING GIST (current_location);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_status ON driver_profiles(status);

-- 3. Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('BIKE', 'SCOOTER', 'AUTO', 'SEDAN', 'SUV', 'VAN', 'TRUCK')),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 4. Service Types
CREATE TABLE IF NOT EXISTS service_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL CHECK (category IN ('RIDE', 'PACKAGE', 'QUICK_COMMERCE', 'BUSINESS', 'SERVICE')),
    base_fare NUMERIC(10, 2) NOT NULL,
    per_km NUMERIC(10, 2) NOT NULL,
    per_minute NUMERIC(10, 2) NOT NULL,
    min_fare NUMERIC(10, 2) NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- 5. Businesses
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    api_key_prefix VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id),
    driver_id UUID REFERENCES driver_profiles(id),
    business_id UUID REFERENCES businesses(id),
    service_type_id VARCHAR(50) NOT NULL REFERENCES service_types(id),
    service_category VARCHAR(30) NOT NULL,

    pickup_address TEXT NOT NULL,
    pickup_location GEOGRAPHY(Point, 4326) NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_location GEOGRAPHY(Point, 4326) NOT NULL,

    distance_km NUMERIC(8, 2) NOT NULL,
    estimated_duration_min INTEGER NOT NULL,

    base_fare NUMERIC(10, 2) NOT NULL,
    distance_fare NUMERIC(10, 2) NOT NULL,
    time_fare NUMERIC(10, 2) NOT NULL,
    surge_multiplier NUMERIC(4, 2) DEFAULT 1.0,
    discount NUMERIC(10, 2) DEFAULT 0,
    final_fare NUMERIC(10, 2) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED' CHECK (
        status IN (
            'REQUESTED',
            'SEARCHING',
            'DRIVER_ASSIGNED',
            'DRIVER_ARRIVING',
            'DRIVER_ARRIVED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED'
        )
    ),

    otp VARCHAR(10),
    package_details JSONB,
    business_reference VARCHAR(100),

    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- 7. Booking Lifecycle Events
CREATE TABLE IF NOT EXISTS booking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    actor_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Driver Location History Samples
CREATE TABLE IF NOT EXISTS driver_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    heading NUMERIC(5, 2),
    speed NUMERIC(5, 2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_driver_locations_time ON driver_locations(driver_id, timestamp DESC);

-- 9. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    method VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    provider_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Ratings
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Demand Zones
CREATE TABLE IF NOT EXISTS demand_zones (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    polygon GEOGRAPHY(Polygon, 4326) NOT NULL,
    current_demand INTEGER DEFAULT 0,
    current_supply INTEGER DEFAULT 0,
    demand_supply_ratio NUMERIC(5, 2) DEFAULT 1.0,
    status VARCHAR(20) DEFAULT 'BALANCED' CHECK (status IN ('LOW', 'BALANCED', 'HIGH', 'CRITICAL')),
    surge_multiplier NUMERIC(4, 2) DEFAULT 1.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Dispatch Attempts (For ML & Analytics)
CREATE TABLE IF NOT EXISTS dispatch_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES driver_profiles(id),
    distance_to_pickup NUMERIC(8, 2) NOT NULL,
    eta INTEGER NOT NULL,
    acceptance_probability NUMERIC(4, 3) NOT NULL,
    score NUMERIC(5, 4) NOT NULL,
    result VARCHAR(20) DEFAULT 'PENDING' CHECK (result IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Delivery Jobs (For Business Multi-Delivery Support)
CREATE TABLE IF NOT EXISTS delivery_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    order_reference VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'EXPRESS')),
    package_size VARCHAR(20) DEFAULT 'MEDIUM' CHECK (package_size IN ('SMALL', 'MEDIUM', 'LARGE', 'BULK')),
    package_weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 1.0,
    pickup_address TEXT NOT NULL,
    pickup_location GEOGRAPHY(Point, 4326) NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_location GEOGRAPHY(Point, 4326) NOT NULL,
    delivery_window_start TIMESTAMP WITH TIME ZONE,
    delivery_window_end TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'DISPATCHED', 'DELIVERED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
