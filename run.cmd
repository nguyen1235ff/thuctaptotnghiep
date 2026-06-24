@echo off
:: Script chạy Food Delivery với đúng Java 21
SET JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot
SET PATH=%JAVA_HOME%\bin;%PATH%

echo =======================================
echo  FOOD DELIVERY - Spring Boot Server
echo  Java: %JAVA_HOME%
echo =======================================
echo.

mvnw.cmd spring-boot:run
