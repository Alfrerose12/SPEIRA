#include <Wire.h>
#include <BH1750.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

#define BME280_ADDR 0x76  // 0x77
#define SDA_PIN 21
#define SCL_PIN 22

BH1750 lightMeter(0x23);
Adafruit_BME280 bme;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Wire.begin(SDA_PIN, SCL_PIN);

  // BH1750
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("BH1750 iniciado correctamente");
  } else {
    Serial.println("BH1750 no detectado");
  }

  // BME280
  if (bme.begin(BME280_ADDR)) {
    Serial.println("BME280 iniciado correctamente");
  } else {
    Serial.println("BME280 no detectado");
  }
}

void loop() {
  float luz = lightMeter.readLightLevel();

  float temperatura = bme.readTemperature();
  float humedad     = bme.readHumidity();
  float presion     = bme.readPressure() / 100.0F;

  Serial.print("Luz: "); Serial.print(luz); Serial.println(" lux");
  Serial.print("Temperatura: "); Serial.print(temperatura); Serial.println(" °C");
  Serial.print("Humedad: "); Serial.print(humedad); Serial.println(" %");
  Serial.print("Presión: "); Serial.print(presion); Serial.println(" hPa");
  Serial.println("----------------------------");

  delay(2000);
}
