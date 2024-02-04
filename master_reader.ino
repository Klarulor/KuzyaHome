#include <DHT11.h>
#include <OneWire.h>
#include <DallasTemperature.h>


void setup() {
  Serial.begin(9600);
  Serial.print(1);
}

const byte numChars = 32;
char receivedChars[numChars]; 

void readCommand(int size){
  if(receivedChars[0] == '1'){
    //pinmode
    char pAr[3] = {receivedChars[2],receivedChars[3],receivedChars[4]};
    uint8_t pin = atoi(pAr);
    if(receivedChars[1] == '1'){
      pinMode(pin, OUTPUT);
    }else{
      pinMode(pin, INPUT);
    }
    
  }else if(receivedChars[0] == '2'){
    
    // readPort
    char pAr[3] = {receivedChars[2],receivedChars[3],receivedChars[4]};
    uint8_t pin = atoi(pAr);

    int res = 0;
    if(receivedChars[1] == '0'){ // analog
      res = analogRead(pin);
    }else{
      res = digitalRead(pin);
    }
    Serial.print(res);
  }else if(receivedChars[0] == '3'){
    // writePort
    char pAr[3] = {receivedChars[2],receivedChars[3],receivedChars[4]};
    uint8_t pin = atoi(pAr);
    Serial.println(receivedChars[2]);
    Serial.println(receivedChars[3]);
    Serial.println(receivedChars[4]);
    Serial.println(pin);

    if(receivedChars[1] == '0'){ // analog
      char vAr[3] = {receivedChars[5],receivedChars[6],receivedChars[7]};
      uint8_t value = atoi(vAr);
      analogWrite(pin, value);
    }else{
      int value;
      if(receivedChars[5] == '0'){
        value = LOW;
      }else{
        value = HIGH;
      }
      digitalWrite(pin, value);
    }
  }else if(receivedChars[0] == '4'){
    if(receivedChars[1] == '1'){
      char pAr[3] = {receivedChars[2],receivedChars[3],receivedChars[4]};
      uint8_t pin = atoi(pAr);
      // DHT11 dht(pin);
      // //dht.readByte();
      // Serial.print("Humidity (%): ");
      // Serial.println((float)dht.readHumidity(), 2);
      // Serial.print("Temperature  (C): ");
      // Serial.println((float)dht.readTemperature(), 2);

      OneWire oneWire(pin);
      DallasTemperature sensors(&oneWire);
      sensors.begin();
      sensors.requestTemperatures();  
      Serial.print(sensors.getTempCByIndex(0)); // Why "byIndex"? You can have more than one IC on the same bus. 0 refers to the first IC on the wire
    }
  }
}


  // for(int i = 0; i < size; i++){
  //   Serial.println(receivedChars[i]);
  // }

void loop() {
  // put your main code here, to run repeatedly:
  char rc;
  char endMarker = '\n';
  static byte ndx = 0;
  while (Serial.available()){
    rc = Serial.read();
    if(rc != endMarker){
      receivedChars[ndx] = rc;
      ndx++;
    }else{
      readCommand(ndx);
      ndx = 0;
    }
  }
}