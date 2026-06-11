# Stage 1: Build the application using Maven
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/gateway-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]