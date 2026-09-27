// EasyRide — Live Operational Traffic & Dispatch Simulation Engine
// Simulates live driver GPS movement, incoming trip requests, automated dispatch, trip lifecycles, and demand shifts in Bengaluru.

const http = require('http');

const API_BASE = 'http://localhost:5000/api/v1';

async function fetchJson(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (e) => resolve({ error: e.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const BENGALURU_ZONES = [
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
  { name: 'Electronic City', lat: 12.8399, lng: 77.677 },
];

async function startSimulation() {
  console.log('===========================================================');
  console.log('  EasyRide — Live Urban Mobility Simulation Started');
  console.log('  Target API:', API_BASE);
  console.log('===========================================================');

  let tick = 0;

  setInterval(async () => {
    tick++;
    console.log(`\n[Simulation Tick #${tick}] Simulating live urban dispatch network...`);

    // 1. Create simulated booking
    const pickupZone = BENGALURU_ZONES[Math.floor(Math.random() * BENGALURU_ZONES.length)];
    const dropZone = BENGALURU_ZONES[Math.floor(Math.random() * BENGALURU_ZONES.length)];

    const bookingRes = await fetchJson(`${API_BASE}/bookings`, 'POST', {
      serviceTypeId: 'service-ride-go',
      serviceCategory: 'RIDE',
      pickup: {
        address: `${pickupZone.name} Sector ${Math.floor(1 + Math.random() * 5)}, Bengaluru`,
        lat: pickupZone.lat + (Math.random() - 0.5) * 0.01,
        lng: pickupZone.lng + (Math.random() - 0.5) * 0.01,
      },
      dropoff: {
        address: `${dropZone.name} Main Rd, Bengaluru`,
        lat: dropZone.lat + (Math.random() - 0.5) * 0.01,
        lng: dropZone.lng + (Math.random() - 0.5) * 0.01,
      },
    });

    if (bookingRes && bookingRes.data) {
      console.log(` -> Booking Created [${bookingRes.data.id}]: ${pickupZone.name} -> ${dropZone.name} (Fare: ₹${bookingRes.data.fare.finalFare})`);

      // 2. Simulate Driver Acceptance after 2 seconds
      setTimeout(async () => {
        const jobsRes = await fetchJson(`${API_BASE}/drivers/jobs`);
        if (jobsRes && jobsRes.data && jobsRes.data.length > 0) {
          const targetJob = jobsRes.data[0];
          const acceptRes = await fetchJson(`${API_BASE}/drivers/jobs/${targetJob.id}/accept`, 'POST', {
            driverId: 'drv-demo',
          });
          console.log(` -> Driver Accepted Job [${targetJob.id}]`);

          // 3. Driver Arrived
          setTimeout(async () => {
            await fetchJson(`${API_BASE}/drivers/jobs/${targetJob.id}/arrived`, 'POST');
            console.log(` -> Driver Arrived at Pickup for Job [${targetJob.id}]`);

            // 4. Trip Started
            setTimeout(async () => {
              await fetchJson(`${API_BASE}/drivers/jobs/${targetJob.id}/start`, 'POST', {
                otp: targetJob.otp || '1234',
              });
              console.log(` -> Trip IN_PROGRESS for Job [${targetJob.id}]`);

              // 5. Trip Completed
              setTimeout(async () => {
                await fetchJson(`${API_BASE}/drivers/jobs/${targetJob.id}/complete`, 'POST');
                console.log(` -> Trip COMPLETED for Job [${targetJob.id}]. Payment & Earnings updated!`);
              }, 3000);
            }, 2000);
          }, 2000);
        }
      }, 2000);
    }
  }, 10000);
}

startSimulation().catch(console.error);
