/*
 * Solar Panel IoT Sensor + AI Control - ESP32
 * 
 * Features:
 * - Reads voltage, current, temperature from sensors
 * - Sends data to FastAPI backend
 * - Receives AI-based control commands
 * - Executes commands via relays (battery charge/discharge, load control)
 * 
 * Hardware Required:
 * - ESP32 Dev Module
 * - ADS1115 I2C ADC Module
 * - ACS712 Current Sensor (5A or 30A)
 * - Voltage Divider Circuit (for voltage measurement)
 * - DS18B20 Temperature Sensor (optional)
 * - 4-Channel Relay Module
 * 
 * Author: Solar Swarm Intelligence Team
 * Date: 2024
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ============ CONFIGURATION ============
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* api_url = "http://192.168.1.100:8000/api/v1/iot/data";
const char* command_url = "http://192.168.1.100:8000/api/v1/iot/command";
const char* device_id = "esp32_sensor_01";

const int SENSOR_INTERVAL = 5000;  // 5 seconds between readings
const int COMMAND_CHECK_INTERVAL = 2000;  // Check for commands every 2 seconds

// ============ CONTROL PINS ============
// Define GPIO pins for controlling relays/loads
#define RELAY_BATTERY_CHARGE 12    // Relay for battery charging
#define RELAY_BATTERY_DISCHARGE 13 // Relay for battery discharging
#define RELAY_LOAD_MAIN 14         // Relay for main load
#define RELAY_GRID_EXPORT 15       // Relay for grid export (if applicable)

// ============ SENSOR SETUP ============
Adafruit_ADS1115 ads;

// Temperature sensor (optional - comment out if not using)
#define USE_TEMPERATURE_SENSOR true
#if USE_TEMPERATURE_SENSOR
const int ONE_WIRE_BUS = 4;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
#endif

// Sensor calibration constants
const float ACS712_SENSITIVITY = 0.185;      // V/A for ACS712-5A (use 0.100 for 30A version)
const float ACS712_ZERO_POINT = 2.5;         // V at 0A
const float VOLTAGE_DIVIDER_RATIO = 10.0;    // Adjust based on your voltage divider
const float ADS1115_VOLTAGE_RANGE = 4.096;   // +/- 4.096V range
const int ADS1115_MAX_VALUE = 32767;         // 16-bit ADC

// Current state tracking
float current_battery_level = 50.0;  // Percentage (0-100) - update from sensor or estimate
bool battery_charging = false;
bool battery_discharging = false;
bool load_enabled = true;

// ============ CONTROL FUNCTIONS ============

void initializeRelays() {
  pinMode(RELAY_BATTERY_CHARGE, OUTPUT);
  pinMode(RELAY_BATTERY_DISCHARGE, OUTPUT);
  pinMode(RELAY_LOAD_MAIN, OUTPUT);
  pinMode(RELAY_GRID_EXPORT, OUTPUT);
  
  // Start with all relays OFF (HIGH = OFF for active LOW relays)
  // Adjust based on your relay module (some are active HIGH)
  digitalWrite(RELAY_BATTERY_CHARGE, HIGH);
  digitalWrite(RELAY_BATTERY_DISCHARGE, HIGH);
  digitalWrite(RELAY_LOAD_MAIN, HIGH);
  digitalWrite(RELAY_GRID_EXPORT, HIGH);
  
  Serial.println("✅ Relays initialized (all OFF)");
}

void executeCommand(String action, float amount = 0.0) {
  Serial.println("🎯 Executing command: " + action + " (amount: " + String(amount) + ")");
  
  if (action == "charge_battery") {
    // Enable battery charging
    digitalWrite(RELAY_BATTERY_CHARGE, LOW);      // Turn ON relay (active LOW)
    digitalWrite(RELAY_BATTERY_DISCHARGE, HIGH);  // Ensure discharge is OFF
    battery_charging = true;
    battery_discharging = false;
    Serial.println("   ✅ Battery charging enabled");
    
  } else if (action == "discharge_battery") {
    // Enable battery discharging
    digitalWrite(RELAY_BATTERY_DISCHARGE, LOW);   // Turn ON relay
    digitalWrite(RELAY_BATTERY_CHARGE, HIGH);     // Ensure charge is OFF
    battery_charging = false;
    battery_discharging = true;
    Serial.println("   ✅ Battery discharging enabled");
    
  } else if (action == "stop_battery") {
    // Stop battery operations
    digitalWrite(RELAY_BATTERY_CHARGE, HIGH);
    digitalWrite(RELAY_BATTERY_DISCHARGE, HIGH);
    battery_charging = false;
    battery_discharging = false;
    Serial.println("   ✅ Battery operations stopped");
    
  } else if (action == "enable_load") {
    // Enable main load
    digitalWrite(RELAY_LOAD_MAIN, LOW);  // Turn ON relay
    load_enabled = true;
    Serial.println("   ✅ Main load enabled");
    
  } else if (action == "disable_load") {
    // Disable main load
    digitalWrite(RELAY_LOAD_MAIN, HIGH);  // Turn OFF relay
    load_enabled = false;
    Serial.println("   ✅ Main load disabled");
    
  } else if (action == "export_to_grid") {
    // Export excess energy to grid
    digitalWrite(RELAY_GRID_EXPORT, LOW);  // Turn ON relay
    Serial.println("   ✅ Grid export enabled");
    
  } else if (action == "stop_grid_export") {
    // Stop grid export
    digitalWrite(RELAY_GRID_EXPORT, HIGH);  // Turn OFF relay
    Serial.println("   ✅ Grid export disabled");
    
  } else {
    Serial.println("   ⚠️ Unknown command: " + action);
  }
}

// ============ SENSOR READING FUNCTIONS ============

float readVoltage() {
  // Read voltage from ADS1115 channel A1 (voltage divider)
  int16_t adc_value = ads.readADC_SingleEnded(1);
  
  // Convert ADC reading to voltage
  float adc_voltage = (float(adc_value) / ADS1115_MAX_VALUE) * ADS1115_VOLTAGE_RANGE;
  
  // Convert back to actual voltage using divider ratio
  float actual_voltage = adc_voltage * VOLTAGE_DIVIDER_RATIO;
  
  // Ensure non-negative
  return max(0.0, actual_voltage);
}

float readCurrent() {
  // Read current from ADS1115 channel A0 (from ACS712)
  int16_t adc_value = ads.readADC_SingleEnded(0);
  
  // Convert ADC to voltage
  float voltage = (float(adc_value) / ADS1115_MAX_VALUE) * ADS1115_VOLTAGE_RANGE;
  
  // ACS712 formula: Current = (voltage - zero_point) / sensitivity
  float current = (voltage - ACS712_ZERO_POINT) / ACS712_SENSITIVITY;
  
  // Handle noise around zero (±0.05A threshold)
  if (abs(current) < 0.05) {
    current = 0.0;
  }
  
  // Only positive current (solar generation)
  return max(0.0, current);
}

float readTemperature() {
  #if USE_TEMPERATURE_SENSOR
    sensors.requestTemperatures();
    float temp = sensors.getTempCByIndex(0);
    
    // Check if reading is valid (DS18B20 returns -127 on error)
    if (temp == -127.00 || isnan(temp)) {
      return 25.0;  // Default temperature if sensor fails
    }
    return temp;
  #else
    return 25.0;  // Default temperature if sensor not used
  #endif
}

float calculatePower(float voltage, float current) {
  return voltage * current;
}

String getTimestamp() {
  // Generate ISO 8601 timestamp
  // For production, consider adding NTP (Network Time Protocol) for real time
  unsigned long seconds = millis() / 1000;
  unsigned long hours = (seconds / 3600) % 24;
  unsigned long minutes = (seconds / 60) % 60;
  unsigned long secs = seconds % 60;
  
  char timestamp[25];
  snprintf(timestamp, sizeof(timestamp), "2024-01-01T%02lu:%02lu:%02lu", hours, minutes, secs);
  return String(timestamp);
}

// ============ API COMMUNICATION ============

bool sendSensorData(float voltage, float current, float power, float temperature) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected!");
    return false;
  }
  
  HTTPClient http;
  http.begin(api_url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);  // 5 second timeout
  
  // Create JSON payload using ArduinoJson v6
  StaticJsonDocument<512> doc;
  doc["device_id"] = device_id;
  
  JsonObject sensorData = doc["sensor_data"].to<JsonObject>();
  sensorData["voltage_v"] = round(voltage * 100) / 100.0;
  sensorData["current_a"] = round(current * 1000) / 1000.0;
  sensorData["power_w"] = round(power * 100) / 100.0;
  sensorData["temperature_c"] = round(temperature * 10) / 10.0;
  sensorData["battery_level_pct"] = current_battery_level;
  sensorData["timestamp"] = getTimestamp();
  
  doc["timestamp"] = getTimestamp();
  
  // Serialize JSON to string
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📤 Sending sensor data...");
  
  // Send POST request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("✅ Data sent successfully");
    
    // Parse response for immediate command (optional)
    StaticJsonDocument<256> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error && responseDoc.containsKey("command")) {
      String action = responseDoc["command"]["action"].as<String>();
      float amount = responseDoc["command"]["amount"] | 0.0;
      executeCommand(action, amount);
    }
    
    http.end();
    return true;
  } else {
    Serial.printf("❌ Error code: %d\n", httpResponseCode);
    if (httpResponseCode == -1) {
      Serial.println("   (Connection timeout - check API URL and server)");
    }
    http.end();
    return false;
  }
}

bool checkForCommands() {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }
  
  HTTPClient http;
  String url = String(command_url) + "?device_id=" + String(device_id);
  http.begin(url);
  http.setTimeout(3000);
  
  Serial.println("📥 Checking for commands...");
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("📥 Response: " + response);
    
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error && doc.containsKey("command")) {
      String action = doc["command"]["action"].as<String>();
      float amount = doc["command"]["amount"] | 0.0;
      String priority = doc["command"]["priority"] | "normal";
      String reason = doc["command"]["reason"] | "";
      
      Serial.println("   Priority: " + priority);
      Serial.println("   Reason: " + reason);
      
      executeCommand(action, amount);
      
      // Confirm command execution
      http.begin(String(command_url) + "/confirm");
      http.addHeader("Content-Type", "application/json");
      StaticJsonDocument<128> confirmDoc;
      confirmDoc["device_id"] = device_id;
      confirmDoc["command"] = action;
      confirmDoc["executed"] = true;
      String confirmJson;
      serializeJson(confirmDoc, confirmJson);
      http.POST(confirmJson);
      http.end();
      
      http.end();
      return true;
    }
  } else if (httpResponseCode == 204) {
    // No commands available (HTTP 204 No Content)
    Serial.println("   (No commands pending)");
  } else {
    Serial.printf("   ❌ Error: %d\n", httpResponseCode);
  }
  
  http.end();
  return false;
}

// ============ SETUP ============

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n");
  Serial.println("═══════════════════════════════════════");
  Serial.println("🔌 Solar Panel IoT + AI Control - ESP32");
  Serial.println("═══════════════════════════════════════");
  Serial.println();
  
  // Initialize relays
  initializeRelays();
  
  // Initialize sensors
  Wire.begin();
  Serial.print("📊 Initializing ADS1115... ");
  if (!ads.begin()) {
    Serial.println("❌ FAILED!");
    Serial.println("   Check I2C connections (SDA/SCL)");
    while (1) {
      delay(1000);
      Serial.println("   Waiting for ADS1115...");
    }
  }
  Serial.println("✅ OK");
  ads.setGain(GAIN_ONE);  // +/- 4.096V range
  
  #if USE_TEMPERATURE_SENSOR
    sensors.begin();
    Serial.println("🌡️  Temperature sensor: ✅ OK");
  #else
    Serial.println("🌡️  Temperature sensor: ⏭️  Disabled");
  #endif
  
  // Connect to WiFi
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi connected!");
    Serial.print("📡 IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📡 Signal strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("📡 API URL: ");
    Serial.println(api_url);
    Serial.print("📡 Command URL: ");
    Serial.println(command_url);
  } else {
    Serial.println("❌ WiFi connection failed!");
    Serial.println("⚠️  Continuing without WiFi (data will not be sent)");
    Serial.println("   Check your SSID and password");
  }
  
  Serial.println();
  Serial.println("🚀 System ready!");
  Serial.println("───────────────────────────────────────");
  Serial.println();
}

// ============ MAIN LOOP ============

unsigned long lastSensorRead = 0;
unsigned long lastCommandCheck = 0;

void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors periodically
  if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
    float voltage = readVoltage();
    float current = readCurrent();
    float power = calculatePower(voltage, current);
    float temperature = readTemperature();
    
    Serial.println("📊 Sensor Readings:");
    Serial.printf("   ⚡ Voltage: %.2f V\n", voltage);
    Serial.printf("   🔌 Current: %.3f A\n", current);
    Serial.printf("   💡 Power: %.2f W\n", power);
    Serial.printf("   🌡️  Temperature: %.1f °C\n", temperature);
    Serial.printf("   🔋 Battery: %.1f%%\n", current_battery_level);
    Serial.printf("   🔄 Status: Charge=%s, Discharge=%s, Load=%s\n",
                  battery_charging ? "ON" : "OFF",
                  battery_discharging ? "ON" : "OFF",
                  load_enabled ? "ON" : "OFF");
    Serial.println();
    
    // Send to backend
    sendSensorData(voltage, current, power, temperature);
    
    lastSensorRead = currentTime;
  }
  
  // Check for commands periodically
  if (currentTime - lastCommandCheck >= COMMAND_CHECK_INTERVAL) {
    checkForCommands();
    lastCommandCheck = currentTime;
  }
  
  delay(100);  // Small delay to prevent watchdog issues
}

