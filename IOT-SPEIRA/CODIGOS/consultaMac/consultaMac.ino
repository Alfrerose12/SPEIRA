#include <WiFi.h>

// Este código sirve para consultar la MAC de cualquier placa
// Las esclavas deben conocer la MAC de la maestra para comunicarse

void setup() {
  Serial.begin(115200);
  delay(1000);
  WiFi.mode(WIFI_STA);
  delay(100);

  String mac = WiFi.macAddress();
  Serial.println("MAC Address:");
  Serial.println(mac);
}

void loop() {
}
