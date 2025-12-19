# ESP32 IoT Prototype Integration Guide

This guide explains how to set up and use the ESP32-based IoT prototype with the Solar Swarm Intelligence backend.

## 📋 Overview

The ESP32 prototype:
1. **Collects** sensor data (voltage, current, temperature) from solar panel
2. **Sends** data to backend API via WiFi
3. **Receives** AI-based control commands from backend
4. **Executes** commands via relays (battery charge/discharge, load control)

## 🔧 Hardware Requirements

### Essential Components:
- **ESP32 Dev Module** (with WiFi)
- **ADS1115** I2C ADC Module (16-bit, for voltage/current measurement)
- **ACS712** Current Sensor (5A or 30A version)
- **Voltage Divider Circuit** (resistors: R1=90kΩ, R2=10kΩ for 10:1 ratio)
- **4-Channel Relay Module** (5V, active LOW)
- **Jumper wires** and breadboard
- **Power supply** for ESP32 (USB or 5V adapter)

### Optional Components:
- **DS18B20** Temperature Sensor (for panel temperature monitoring)
- **LCD Display** (for local monitoring)
- **Battery** (12V or 24V, depending on your solar panel)

## 📐 Hardware Wiring

### Sensor Connections:

```
ESP32 Pinout:
═══════════════════════════════════════════════════════

ADS1115 Module (I2C):
├── VDD → ESP32 3.3V
├── GND → ESP32 GND
├── SDA → ESP32 GPIO 21 (default I2C SDA)
└── SCL → ESP32 GPIO 22 (default I2C SCL)

ACS712 Current Sensor:
├── VCC → ESP32 5V (or external 5V if using 5V version)
├── GND → ESP32 GND
└── OUT → ADS1115 A0 (Channel 0)

Voltage Divider Circuit:
├── Solar Panel (+) → R1 (90kΩ) → ADS1115 A1
├── ADS1115 A1 → R2 (10kΩ) → GND
└── Solar Panel (-) → GND

DS18B20 Temperature Sensor (Optional):
├── Red (VCC) → ESP32 3.3V
├── Black (GND) → ESP32 GND
├── Yellow (Data) → ESP32 GPIO 4
└── 4.7kΩ resistor between Data and VCC (pull-up)

4-Channel Relay Module:
├── VCC → ESP32 5V
├── GND → ESP32 GND
├── IN1 → ESP32 GPIO 12 (Battery Charge Relay)
├── IN2 → ESP32 GPIO 13 (Battery Discharge Relay)
├── IN3 → ESP32 GPIO 14 (Main Load Relay)
└── IN4 → ESP32 GPIO 15 (Grid Export Relay)

Relay Outputs (Normally Open - NO):
├── RELAY 1 (Battery Charge):
│   ├── Solar Panel (+) → Relay COM
│   └── Relay NO → Battery (+) via Charge Controller
│
├── RELAY 2 (Battery Discharge):
│   ├── Battery (+) → Relay COM
│   └── Relay NO → Load Circuit
│
├── RELAY 3 (Main Load):
│   ├── Power Source → Relay COM
│   └── Relay NO → Load
│
└── RELAY 4 (Grid Export):
    ├── Inverter Output → Relay COM
    └── Relay NO → Grid Connection
```

## 💻 Software Setup

### Step 1: Install Arduino IDE

Download from: https://www.arduino.cc/en/software

### Step 2: Install ESP32 Board Support

1. **File → Preferences → Additional Board Manager URLs:**
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```

2. **Tools → Board → Boards Manager**
   - Search for "ESP32"
   - Install "esp32 by Espressif Systems"

3. **Select Board:**
   - Tools → Board → ESP32 Arduino → ESP32 Dev Module

### Step 3: Install Required Libraries

**Tools → Manage Libraries → Install:**
- **Adafruit ADS1X15** (by Adafruit) - For ADC module
- **ArduinoJson** (by Benoit Blanchon) - Version 6.x
- **DallasTemperature** (by Miles Burton) - For DS18B20
- **OneWire** (by Paul Stoffregen) - For DS18B20

### Step 4: Configure ESP32 Code

Open `esp32_solar_iot.ino` and update:

```cpp
// Line 23-26: Update with your values
const char* ssid = "YOUR_WIFI_SSID";           // Your WiFi network name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password
const char* api_url = "http://192.168.1.100:8000/api/v1/iot/data";  // Your computer's IP
const char* device_id = "esp32_sensor_01";     // Unique device ID
```

**To find your computer's IP address:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

### Step 5: Upload Code

1. Connect ESP32 via USB
2. Select correct COM port: **Tools → Port**
3. Click **Upload** button
4. Open **Serial Monitor** (115200 baud) to see output

## 🚀 Backend Setup

### Step 1: Start Backend API

```bash
cd /path/to/PES
python main.py api
```

The API should start on `http://localhost:8000`

### Step 2: Verify Endpoints

Test the IoT endpoints:
```bash
# Test IoT data endpoint
curl -X POST http://localhost:8000/api/v1/iot/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device",
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

# Test command endpoint
curl "http://localhost:8000/api/v1/iot/command?device_id=test_device"
```

## 🔄 System Flow

```
1. ESP32 reads sensors (voltage, current, temp)
   ↓
2. ESP32 sends data to POST /api/v1/iot/data
   ↓
3. Backend processes data:
   - Anomaly detection (Isolation Forest/Autoencoder)
   - Forecasting (LSTM/Prophet) → predicts next hour
   - Decision logic → determines best action
   ↓
4. Backend stores command in device_commands
   ↓
5. ESP32 polls GET /api/v1/iot/command?device_id=esp32_sensor_01
   ↓
6. ESP32 receives command (e.g., "charge_battery")
   ↓
7. ESP32 executes command (turns on relay)
   ↓
8. ESP32 confirms execution POST /api/v1/iot/command/confirm
```

## 🎯 AI Decision Logic

The backend uses intelligent decision-making based on:

1. **Current Production**: Solar panel power output
2. **Forecasted Production**: AI-predicted next hour output
3. **Battery Level**: Current battery state of charge
4. **Anomaly Detection**: Detects unusual patterns

**Command Types:**
- `charge_battery` - Enable battery charging
- `discharge_battery` - Enable battery discharging
- `stop_battery` - Stop battery operations
- `enable_load` - Enable main load
- `disable_load` - Disable main load
- `export_to_grid` - Export excess to grid
- `stop_grid_export` - Stop grid export

## 📊 Expected Output

### Serial Monitor Output:
```
═══════════════════════════════════════
🔌 Solar Panel IoT + AI Control - ESP32
═══════════════════════════════════════

✅ Relays initialized (all OFF)
📊 Initializing ADS1115... ✅ OK
🌡️  Temperature sensor: ✅ OK
📡 Connecting to WiFi: MyNetwork...
✅ WiFi connected!
📡 IP address: 192.168.1.50
📡 API URL: http://192.168.1.100:8000/api/v1/iot/data

🚀 System ready!
───────────────────────────────────────

📊 Sensor Readings:
   ⚡ Voltage: 12.34 V
   🔌 Current: 0.456 A
   💡 Power: 5.63 W
   🌡️  Temperature: 28.5 °C
   🔋 Battery: 50.0%
   🔄 Status: Charge=OFF, Discharge=OFF, Load=ON

📤 Sending sensor data...
✅ Data sent successfully
📥 Checking for commands...
🎯 Executing command: charge_battery (amount: 2.5)
   Priority: high
   Reason: High production (0.00563kW), charging battery
   ✅ Battery charging enabled
```

## 🔧 Calibration

### Current Sensor (ACS712):
- With no load, measure voltage at OUT pin (should be ~2.5V)
- If different, adjust `ACS712_ZERO_POINT` in code
- For 30A version, change `ACS712_SENSITIVITY` to 0.100

### Voltage Divider:
- Ratio = (R1 + R2) / R2
- Example: R1=90kΩ, R2=10kΩ → Ratio = 10
- Update `VOLTAGE_DIVIDER_RATIO` in code accordingly

## 🐛 Troubleshooting

### Problem: ADS1115 not detected
- **Solution**: Check I2C connections (SDA/SCL), ensure 3.3V power

### Problem: WiFi connection failed
- **Solution**: Check SSID/password, ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)

### Problem: API connection timeout
- **Solution**: 
  - Check API server is running
  - Verify IP address is correct
  - Check firewall settings
  - Ensure ESP32 and computer are on same network

### Problem: Current readings always zero
- **Solution**: 
  - Calibrate ACS712 zero point
  - Check sensor connections
  - Verify sensor is properly powered

### Problem: Voltage readings incorrect
- **Solution**: 
  - Adjust `VOLTAGE_DIVIDER_RATIO` based on actual resistor values
  - Check voltage divider connections

### Problem: Commands not executing
- **Solution**:
  - Check relay module connections
  - Verify relay is active LOW or HIGH (adjust code accordingly)
  - Test relays manually with simple GPIO test

## 📝 Notes

- **Battery Level**: Currently uses fixed value. For production, add battery voltage monitoring or BMS integration
- **Command Store**: Uses in-memory dictionary. For production, use Redis or database for persistence
- **Relay Logic**: Code assumes active LOW relays. Adjust `LOW`/`HIGH` values if your relays are active HIGH
- **Safety**: Add fuses and proper protection circuits in production deployment

## 📚 Additional Resources

- ESP32 Documentation: https://docs.espressif.com/
- ADS1115 Datasheet: https://www.ti.com/product/ADS1115
- ACS712 Datasheet: https://www.allegromicro.com/en/products/sense/current-sensor-ics/zero-to-fifty-amp-integrated-conductor-sensor-ics/acs712
- ArduinoJson Documentation: https://arduinojson.org/

## 🎉 Next Steps

1. **Test Basic Sensors**: Verify voltage, current, temperature readings
2. **Test API Connection**: Confirm data is being sent to backend
3. **Test Commands**: Verify relays are responding to commands
4. **Integrate with Real System**: Connect to actual solar panel and battery
5. **Monitor and Optimize**: Use backend dashboard to monitor system performance

