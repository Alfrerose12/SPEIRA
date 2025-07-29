#include <WiFi.h>
#include <HTTPClient.h>

// Este codigo se uso para simular el envio de datos constamente para comprobar la estabilidad

const char* ssid     = "LabAlimentos";
const char* password = "lca2018*";

const char* serverName = "https://api.speira.site/api/datos";

unsigned long lastTime = 0;
unsigned long timerDelay = 10000;

void setup() {
  Serial.begin(115200);
  
  delay(1000);

  WiFi.begin(ssid, password);
  Serial.print("Conectando a Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n Conectado a Wi-Fi");
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {
    lastTime = millis();

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;

      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");

      // Datos aleatorios
      float ph = random(60, 85) / 10.0;
      int tempAgua = random(25, 35);
      int tempAmbiente = random(20, 30);
      int humedad = random(40, 70);
      int luz = random(200, 1000);
      int conductividad = random(1000, 2000);
      int co2 = random(300, 600);

      String jsonData = "{";
      jsonData += "\"nombre\":\"Estanque 1\",";
      jsonData += "\"ph\":" + String(ph, 1) + ",";
      jsonData += "\"temperaturaAgua\":" + String(tempAgua) + ",";
      jsonData += "\"temperaturaAmbiente\":" + String(tempAmbiente) + ",";
      jsonData += "\"humedad\":" + String(humedad) + ",";
      jsonData += "\"luminosidad\":" + String(luz) + ",";
      jsonData += "\"conductividadElectrica\":" + String(conductividad) + ",";
      jsonData += "\"co2\":" + String(co2);
      jsonData += "}";

      int httpResponseCode = http.POST(jsonData);

      Serial.print("Enviando datos: ");
      Serial.println(jsonData);
      Serial.print("Código de respuesta: ");
      Serial.println(httpResponseCode);

      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("Respuesta del servidor:");
        Serial.println(response);
      } else {
        Serial.print("Error en la solicitud: ");
        Serial.println(http.errorToString(httpResponseCode).c_str());
      }

      http.end();
    } else {
      Serial.println("Wi-Fi no conectado");
    }
  }
}
