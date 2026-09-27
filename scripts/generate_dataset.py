# EasyRide — Bengaluru Synthetic Urban Mobility Dataset Generator
# Generates realistic spatial-temporal dataset:
# - 500 Drivers
# - 2,000 Customers
# - 50 Businesses
# - 20 Demand Zones
# - 10,000 Historical Bookings & Dispatch Records

import json
import random
import math
from datetime import datetime, timedelta
import os

BENGALURU_ZONES = [
    {"id": "zone-koramangala", "name": "Koramangala", "lat": 12.9352, "lng": 77.6245, "base_demand": 1.4},
    {"id": "zone-hsr-layout", "name": "HSR Layout", "lat": 12.9121, "lng": 77.6446, "base_demand": 1.35},
    {"id": "zone-indiranagar", "name": "Indiranagar", "lat": 12.9784, "lng": 77.6408, "base_demand": 1.5},
    {"id": "zone-whitefield", "name": "Whitefield", "lat": 12.9698, "lng": 77.7499, "base_demand": 1.8},
    {"id": "zone-electronic-city", "name": "Electronic City", "lat": 12.8399, "lng": 77.6770, "base_demand": 1.45},
    {"id": "zone-bellandur", "name": "Bellandur", "lat": 12.9260, "lng": 77.6762, "base_demand": 1.6},
    {"id": "zone-marathahalli", "name": "Marathahalli", "lat": 12.9592, "lng": 77.6974, "base_demand": 1.5},
    {"id": "zone-btm-layout", "name": "BTM Layout", "lat": 12.9166, "lng": 77.6101, "base_demand": 1.3},
    {"id": "zone-silk-board", "name": "Silk Board", "lat": 12.9177, "lng": 77.6238, "base_demand": 1.75},
    {"id": "zone-majestic", "name": "Majestic", "lat": 12.9767, "lng": 77.5713, "base_demand": 1.65},
    {"id": "zone-jayanagar", "name": "Jayanagar", "lat": 12.9250, "lng": 77.5938, "base_demand": 1.2},
    {"id": "zone-jp-nagar", "name": "JP Nagar", "lat": 12.9077, "lng": 77.5854, "base_demand": 1.15},
    {"id": "zone-banashankari", "name": "Banashankari", "lat": 12.9255, "lng": 77.5468, "base_demand": 1.1},
    {"id": "zone-hebbal", "name": "Hebbal", "lat": 13.0358, "lng": 77.5970, "base_demand": 1.4},
    {"id": "zone-manyata", "name": "Manyata Tech Park", "lat": 13.0451, "lng": 77.6204, "base_demand": 1.7},
    {"id": "zone-yelahanka", "name": "Yelahanka", "lat": 13.1007, "lng": 77.5963, "base_demand": 1.05},
    {"id": "zone-peenya", "name": "Peenya", "lat": 13.0329, "lng": 77.5273, "base_demand": 1.25},
    {"id": "zone-kengeri", "name": "Kengeri", "lat": 12.9081, "lng": 77.4856, "base_demand": 1.0},
    {"id": "zone-nagarbhavi", "name": "Nagarbhavi", "lat": 12.9600, "lng": 77.5103, "base_demand": 1.05},
    {"id": "zone-airport", "name": "Kempegowda Airport", "lat": 13.1986, "lng": 77.7066, "base_demand": 1.9}
]

VEHICLE_TYPES = ["BIKE", "SCOOTER", "AUTO", "SEDAN", "SUV", "VAN", "TRUCK"]
SERVICE_TYPES = [
    "service-ride-bike", "service-ride-auto", "service-ride-go", "service-ride-xl",
    "service-package-express", "service-qcommerce", "service-business-fleet", "service-technician"
]

FIRST_NAMES = ["Aarav", "Aditi", "Ananya", "Arjun", "Dev", "Diya", "Ishaan", "Kavya", "Manish", "Neha", "Pranav", "Priya", "Rahul", "Rohan", "Sanya", "Shreya", "Tanvi", "Varun", "Vikram", "Yash"]
LAST_NAMES = ["Rao", "Sharma", "Nair", "Patel", "Reddy", "Gowda", "Kumar", "Singh", "Murthy", "Joshi", "Hegde", "Bhat", "Deshmukh", "Kulkarni", "Menon", "Verma", "Chauhan", "Sen", "Pillai", "Iyer"]
COMPANY_PREFIXES = ["Zap", "Urban", "Swift", "Apex", "Omni", "Hyper", "Prime", "Nexus", "Metro", "Velo"]
COMPANY_SUFFIXES = ["Logistics", "Delivery", "Pharma", "Foods", "Express", "Retail", "Services", "Tech"]

def generate_random_coords_near(lat, lng, radius_km=3.0):
    r = random.uniform(0.1, radius_km) / 111.0
    theta = random.uniform(0, 2 * math.pi)
    d_lat = r * math.cos(theta)
    d_lng = r * math.sin(theta) / math.cos(math.radians(lat))
    return round(lat + d_lat, 6), round(lng + d_lng, 6)

def generate_dataset():
    print("Generating EasyRide Bengaluru Mobility Dataset...")
    random.seed(42)

    # 1. Customers
    customers = []
    for i in range(1, 2001):
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        email = f"customer_{i}@easyride.demo"
        phone = f"+9198765{i:05d}"
        customers.append({
            "id": f"usr-cust-{i:04d}",
            "name": name,
            "email": email,
            "phone": phone,
            "role": "CUSTOMER",
            "rating": round(random.uniform(4.2, 5.0), 2)
        })

    # Demo default user
    customers[0]["email"] = "customer@easyride.com"
    customers[0]["name"] = "Priya Sharma (Customer Demo)"

    # 2. Drivers
    drivers = []
    statuses = ["ONLINE", "ONLINE", "ONLINE", "IN_TRIP", "OFFLINE"]
    for i in range(1, 501):
        zone = random.choice(BENGALURU_ZONES)
        lat, lng = generate_random_coords_near(zone["lat"], zone["lng"], 4.0)
        v_type = random.choice(VEHICLE_TYPES)
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        status = random.choice(statuses)

        drivers.append({
            "id": f"drv-{i:04d}",
            "userId": f"usr-drv-{i:04d}",
            "name": name,
            "email": f"driver_{i}@easyride.demo",
            "phone": f"+9199887{i:05d}",
            "licenseNumber": f"KA-01-2023-{i:05d}",
            "status": status,
            "rating": round(random.uniform(4.4, 5.0), 2),
            "acceptanceRate": random.randint(75, 99),
            "cancellationRate": random.randint(1, 10),
            "totalTrips": random.randint(50, 1200),
            "totalEarnings": random.randint(5000, 150000),
            "currentLat": lat,
            "currentLng": lng,
            "heading": random.randint(0, 360),
            "speed": random.randint(0, 45) if status != "OFFLINE" else 0,
            "vehicle": {
                "id": f"veh-{i:04d}",
                "driverId": f"drv-{i:04d}",
                "type": v_type,
                "brand": "Hero" if v_type in ["BIKE", "SCOOTER"] else ("Bajaj" if v_type == "AUTO" else "Tata"),
                "model": "Splendor" if v_type == "BIKE" else ("RE" if v_type == "AUTO" else "Nexon"),
                "registrationNumber": f"KA-{random.randint(1,55):02d}-M-{random.randint(1000,9999)}",
                "capacity": 1 if v_type in ["BIKE", "SCOOTER"] else (3 if v_type == "AUTO" else 4)
            }
        })

    # Demo default driver
    drivers[0]["email"] = "driver@easyride.com"
    drivers[0]["name"] = "Vikram Rao (Driver Demo)"
    drivers[0]["status"] = "ONLINE"

    # 3. Businesses
    businesses = []
    for i in range(1, 51):
        c_name = f"{random.choice(COMPANY_PREFIXES)} {random.choice(COMPANY_SUFFIXES)}"
        businesses.append({
            "id": f"biz-{i:03d}",
            "userId": f"usr-biz-{i:03d}",
            "companyName": c_name,
            "industry": random.choice(["E-commerce", "Quick Commerce", "Pharmacy", "Restaurant", "Urban Logistics"]),
            "email": f"biz_{i}@easyride.demo",
            "phone": f"+9188776{i:05d}",
            "apiKeyPrefix": f"er_live_{c_name[:3].lower()}{i:02d}",
            "status": "ACTIVE"
        })

    businesses[0]["email"] = "business@easyride.com"
    businesses[0]["companyName"] = "Apex Quick Commerce (Demo)"

    # 4. Historical Bookings (10,000)
    print("Generating 10,000 synthetic historical booking records...")
    bookings = []
    dispatch_records = []
    now = datetime.now()

    for i in range(1, 10001):
        days_ago = random.uniform(0, 30)
        req_time = now - timedelta(days=days_ago)
        
        pickup_zone = random.choice(BENGALURU_ZONES)
        drop_zone = random.choice(BENGALURU_ZONES)
        
        p_lat, p_lng = generate_random_coords_near(pickup_zone["lat"], pickup_zone["lng"], 2.0)
        d_lat, d_lng = generate_random_coords_near(drop_zone["lat"], drop_zone["lng"], 2.0)

        # Distance estimation
        d_lat_km = (d_lat - p_lat) * 111.0
        d_lng_km = (d_lng - p_lng) * 111.0 * math.cos(math.radians(p_lat))
        dist_km = max(1.2, round(math.sqrt(d_lat_km**2 + d_lng_km**2), 2))
        est_duration = max(5, int(dist_km * 3.5 + random.randint(2, 10)))

        srv_id = random.choice(SERVICE_TYPES)
        srv_cat = "RIDE" if "ride" in srv_id else ("PACKAGE" if "package" in srv_id else "BUSINESS")

        base_fare = 35.0
        per_km = 12.0
        subtotal = base_fare + dist_km * per_km + est_duration * 1.5
        surge = 1.0
        if pickup_zone["base_demand"] > 1.5 and random.random() < 0.4:
            surge = round(random.uniform(1.2, 1.8), 1)

        final_fare = round(subtotal * surge, 2)

        # Outcome status
        r_val = random.random()
        if r_val < 0.82:
            status = "COMPLETED"
        elif r_val < 0.94:
            status = "CANCELLED"
        else:
            status = "COMPLETED"

        cust = random.choice(customers)
        drv = random.choice(drivers)

        b_id = f"bk-{i:06d}"
        bookings.append({
            "id": b_id,
            "customerId": cust["id"],
            "driverId": drv["id"] if status == "COMPLETED" else None,
            "serviceTypeId": srv_id,
            "serviceCategory": srv_cat,
            "pickup": {
                "address": f"{pickup_zone['name']} Sector {random.randint(1,7)}, Bengaluru",
                "lat": p_lat,
                "lng": p_lng,
                "zoneId": pickup_zone["id"]
            },
            "dropoff": {
                "address": f"{drop_zone['name']} Main Rd, Bengaluru",
                "lat": d_lat,
                "lng": d_lng,
                "zoneId": drop_zone["id"]
            },
            "distanceKm": dist_km,
            "estimatedDurationMin": est_duration,
            "fare": {
                "baseFare": base_fare,
                "distanceFare": round(dist_km * per_km, 2),
                "timeFare": round(est_duration * 1.5, 2),
                "surgeMultiplier": surge,
                "subtotal": round(subtotal, 2),
                "finalFare": final_fare
            },
            "status": status,
            "requestedAt": req_time.isoformat(),
            "completedAt": (req_time + timedelta(minutes=est_duration)).isoformat() if status == "COMPLETED" else None,
            "cancelledAt": (req_time + timedelta(minutes=random.randint(1, 5))).isoformat() if status == "CANCELLED" else None,
            "cancelReason": random.choice(["Driver took too long", "Changed plans", "Price too high"]) if status == "CANCELLED" else None
        })

        # Dispatch record
        dispatch_records.append({
            "id": f"disp-{i:06d}",
            "bookingId": b_id,
            "driverId": drv["id"],
            "distanceToPickupKm": round(random.uniform(0.5, 4.5), 2),
            "etaMinutes": random.randint(2, 12),
            "acceptanceProbability": round(random.uniform(0.6, 0.98), 3),
            "score": round(random.uniform(0.5, 0.95), 4),
            "result": "ACCEPTED" if status == "COMPLETED" else random.choice(["REJECTED", "EXPIRED"])
        })

    dataset = {
        "generatedAt": now.isoformat(),
        "zones": BENGALURU_ZONES,
        "customers": customers,
        "drivers": drivers,
        "businesses": businesses,
        "bookingsCount": len(bookings),
        "bookings": bookings,
        "dispatchAttempts": dispatch_records
    }

    out_dir = os.path.join(os.path.dirname(__file__), "..", "database", "seeds")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "bengaluru_mobility_dataset.json")

    with open(out_path, "w") as f:
        json.dump(dataset, f, indent=2)

    print(f"Dataset successfully created at {out_path} ({len(bookings)} bookings, {len(drivers)} drivers, {len(customers)} customers)")

if __name__ == "__main__":
    generate_dataset()
