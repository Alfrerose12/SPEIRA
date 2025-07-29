#define PIN_PH 34
const float VREF = 3.3;
const int ADC_RES = 4095;

 // Este código se uso para calibrar los sensores de pH
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("📈 Lectura de pH calibrada con precisión (pH 7 y 10)");
}

void loop() {
  int adc = analogRead(PIN_PH);
  float voltage = adc * (VREF / ADC_RES);

  float ph = 7.0 - (voltage - 2.50) * 5.4545;

  Serial.print("Voltaje: ");
  Serial.print(voltage, 3);
  Serial.print(" V | pH estimado: ");
  Serial.println(ph, 2);

  delay(2000);
}
