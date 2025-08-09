#include <Wire.h>
#include <Adafruit_BME280.h>
#include <BH1750.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Pines para sensores
#define PIN_PH 35
#define ONE_WIRE_BUS 4

Adafruit_BME280 bme;
BH1750 lightMeter;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature ds18b20(&oneWire);

// Calibración por voltaje para sensor de pH
const float voltajePH7  = 2.50;
const float voltajePH10 = 2.00;
const float voltajePH12 = 1.90;

// Información de la red Wifi en el area experimental
const char* ssid = "ESPIRULINA";
const char* password = "SPIR@2025";

// Dirección de la API 
const char* serverName = "https://api.speira.site/api/datos";
unsigned long lastTime = 0;
unsigned long timerDelay = 5000;  // Ciclos de envío de datos

bool inicioRetrasado = false;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Inicio de sensores
  if (!bme.begin(0x76)) {
    Serial.println("Error al iniciar BME280");
  }
  if (!lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("Error al iniciar BH1750");
  }
  ds18b20.begin();
  analogReadResolution(12);

  // Inicio de conexión a Wifi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConectado a WiFi");
}

void loop() {
  // Espera tras conectar a WiFi
  if (!inicioRetrasado && WiFi.status() == WL_CONNECTED) { 
    delay(2000); // Retraso para evitar conflicto de inserciones
    inicioRetrasado = true;
    lastTime = millis();
  }

  if (inicioRetrasado && millis() - lastTime > timerDelay) {
    lastTime = millis();

    // Lectura de datos
    float tempAmbiente = bme.readTemperature();
    float humedad = bme.readHumidity();
    float lux = lightMeter.readLightLevel();

    ds18b20.requestTemperatures();
    float tempAgua = ds18b20.getTempCByIndex(0);

    float voltajePH = leerVoltajePromedio(PIN_PH);
    float ph = calcularPH(voltajePH);

    // Cuerpo del JSON para la base de datos
    String jsonData = "{";
    jsonData += "\"nombre\":\"Caja 4\","; // Cambia el nombre según el estanque, caja o piscina 1,2 o 3
    jsonData += "\"ph\":" + String(ph, 2) + ",";
    jsonData += "\"temperaturaAgua\":" + String(tempAgua, 2) + ",";
    jsonData += "\"temperaturaAmbiente\":" + String(tempAmbiente, 2) + ",";
    jsonData += "\"humedad\":" + String(humedad, 2) + ",";
    jsonData += "\"luminosidad\":" + String(lux, 0) + ",";
    jsonData += "\"conductividadElectrica\":0,";
    jsonData += "\"co2\":0";
    jsonData += "}";

    // Envío a la API
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");

      int responseCode = http.POST(jsonData);
      Serial.println("\nEnviando datos a API");
      Serial.println(jsonData);
      Serial.print("Respuesta HTTP: ");
      Serial.println(responseCode);

      if (responseCode > 0) {
        String response = http.getString();
        Serial.println("Respuesta del servidor:");
        Serial.println(response);
      } else {
        Serial.print("Error en la solicitud: ");
        Serial.println(http.errorToString(responseCode).c_str());
      }

      http.end();
    } else {
      Serial.println("Error: WiFi desconectado");
    }
  }
}

// Métodos para calibración de sensor de pH

float leerVoltajePromedio(int pin) {
  long suma = 0;
  for (int i = 0; i < 10; i++) {
    suma += analogRead(pin);
    delay(10);
  }
  float promedioADC = suma / 10.0;
  return promedioADC * 3.3 / 4095.0;
}

float calcularPH(float voltaje) {
  if (voltaje >= voltajePH7) {
    return 7.0;
  } else if (voltaje <= voltajePH12) {
    return 12.0;
  } else if (voltaje > voltajePH10) {
    return 7.0 + (voltajePH7 - voltaje) * (10.0 - 7.0) / (voltajePH7 - voltajePH10);
  } else {
    return 10.0 + (voltajePH10 - voltaje) * (12.0 - 10.0) / (voltajePH10 - voltajePH12);
  }
}
