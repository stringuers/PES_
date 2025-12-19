# Quick Setup Guide for ESP32 IoT Prototype

## 🚀 Quick Start (5 Steps)

### Step 1: Update ESP32 Code Configuration

Open `iot/esp32_solar_iot.ino` and update these lines:

```cpp
const char* ssid = "YOUR_WIFI_SSID";           // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password
const char* api_url = "http://YOUR_IP:8000/api/v1/iot/data";
const char* device_id = "esp32_sensor_01";
```

**Find your computer's IP:**
- macOS/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig` (look for IPv4 Address)

### Step 2: Upload Code to ESP32

1. Install Arduino IDE
2. Install ESP32 board support (see README.md)
3. Install libraries: Adafruit ADS1X15, ArduinoJson, DallasTemperature, OneWire
4. Open `esp32_solar_iot.ino`
5. Select: Tools → Board → ESP32 Dev Module
6. Select: Tools → Port → (your ESP32 port)
7. Click Upload
8. Open Serial Monitor (115200 baud)

### Step 3: Start Backend API

```bash
cd /path/to/PES
python main.py api
```

API will start on `http://localhost:8000`

### Step 4: Wire Hardware

See `iot/README.md` for detailed wiring diagram.

**Quick checklist:**
- ✅ ADS1115: SDA→GPIO21, SCL→GPIO22, VCC→3.3V, GND→GND
- ✅ ACS712: OUT→ADS1115 A0, VCC→5V, GND→GND
- ✅ Voltage Divider: Panel(+)→R1→ADS1115 A1→R2→GND
- ✅ Relays: IN1-4→GPIO12-15, VCC→5V, GND→GND

### Step 5: Test System

1. **ESP32 Serial Monitor** should show:
   ```
   ✅ WiFi connected!
   📊 Sensor Readings: ...
   ✅ Data sent successfully
   ```

2. **Backend logs** should show:
   ```
   📡 IoT data from esp32_sensor_01: 5.63W ...
   🎯 Decision for esp32_sensor_01: charge_battery ...
   ```

3. **Test API manually:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/iot/data \
     -H "Content-Type: application/json" \
     -d '{
       "device_id": "test",
       "sensor_data": {
         "voltage_v": 12.5,
         "current_a": 0.5,
         "power_w": 6.25,
         "temperature_c": 25.0,
         "battery_level_pct": 50.0,
         "timestamp": "2024-01-01T12:00:00"
       },
       "timestamp": "2024-01-01T12:00:00"
     }'
   ```

## ✅ Verification Checklist

- [ ] ESP32 connects to WiFi
- [ ] ADS1115 detected (check Serial Monitor)
- [ ] Sensor readings appear in Serial Monitor
- [ ] Data sent successfully (✅ in Serial Monitor)
- [ ] Backend receives data (check API logs)
- [ ] Commands are received by ESP32
- [ ] Relays respond to commands

## 🐛 Common Issues

**WiFi not connecting:**
- Check SSID/password
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)

**API timeout:**
- Check computer IP address is correct
- Ensure ESP32 and computer on same network
- Check firewall allows port 8000

**No sensor readings:**
- Check I2C connections (SDA/SCL)
- Verify ADS1115 is powered (3.3V)
- Check sensor connections

**Commands not executing:**
- Verify relay module is powered
- Check GPIO pin connections
- Test relay with simple GPIO toggle code

## 📞 Next Steps

1. **Calibrate sensors** (voltage divider ratio, current sensor zero point)
2. **Test with real solar panel** (start with low voltage for safety)
3. **Monitor system** via backend API and dashboard
4. **Optimize decision logic** based on real-world behavior

For detailed information, see `iot/README.md`

