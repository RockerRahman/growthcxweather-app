import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Switch,
  Input,
  Layout,
  Typography,
  List,
} from "antd";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { ArrowLeftOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Header, Content, Footer } = Layout;
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const API_KEY = "bebc1c9bcc22a97d80b625d0407799b7";

const fetchWeatherData = async (cityName) => {
  try {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
    );
    if (!currentResponse.ok) {
      throw new Error("City not found.");
    }
    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
    );
    if (!forecastResponse.ok) {
      throw new Error("Forecast data not found.");
    }
    const forecastData = await forecastResponse.json();

    const forecast = forecastData.list
      .filter((item, index) => index % 8 === 0)
      .slice(0, 5)
      .map((item) => ({
        date: new Date(item.dt_txt).toLocaleDateString("en-US", {
          weekday: "long",
        }),
        temp: item.main.temp,
        condition: item.weather[0].description,
      }));

    return {
      name: currentData.name,
      country: currentData.sys.country,
      current: {
        temp: currentData.main.temp,
        condition: currentData.weather[0].description,
        high: currentData.main.temp_max,
        low: currentData.main.temp_min,
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        windSpeed: currentData.wind.speed,
      },
      forecast,
    };
  } catch (error) {
    throw error;
  }
};

const Weather = () => {
  const [cityName, setCityName] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const Navigate = useNavigate();

  useEffect(() => {
    const savedCities = JSON.parse(localStorage.getItem("cities")) || [];
    setCities(savedCities);
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      localStorage.setItem("cities", JSON.stringify(cities));
    }
  }, [cities]);

  const handleAddCity = async () => {
    try {
      const data = await fetchWeatherData(cityName);
      setCities((prev) => {
        const newCities = [...prev, data];
        return newCities;
      });
      setCityName("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogOut = () => {
    Navigate("/login");
  };

  const handleRemoveCity = (city) => {
    const updatedCities = cities.filter((c) => c.name !== city.name);
    setCities(updatedCities);
    if (selectedCity?.name === city.name) {
      setSelectedCity(null);
    }
  };

  const convertTemp = (temp) => (isCelsius ? temp : (temp * 9) / 5 + 32);

  const getGraphData = (city) => {
    return {
      labels: city.forecast.map((f) => f.date),
      datasets: [
        {
          label: `Temperature (${isCelsius ? "°C" : "°F"})`,
          data: city.forecast.map((f) => convertTemp(f.temp)),
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.2,
        },
      ],
    };
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Layout
          style={{
            flex: 1,
            padding: "30px",
            background:
              "linear-gradient(90deg, rgba(65,129,217,1) 0%, rgba(159,244,234,1) 100%)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <br />

          {!selectedCity ? (
            <>
              <Row justify="space-between" style={{ alignItems: "center" }}>
                <Col span={13}>
                  <Typography
                    style={{
                      fontWeight: "bold",
                      fontSize: "30px",
                      backgroundImage:
                        "linear-gradient(90deg, rgba(11,46,94,1) 0%, rgba(167,119,224,1) 51%, rgba(251,251,251,1) 100%)",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    Welcome {localStorage.getItem("Current")},
                  </Typography>
                </Col>
                <Col>
                  <Button
                    onClick={handleLogOut}
                    type="submit"
                    style={{
                      backgroundColor: "rgba(5, 5, 5, 0.1)",
                      boxShadow: "none",
                      border: "none",
                    }}
                    icon={<LoginOutlined />}
                    size="medium"
                  >
                    Logout
                  </Button>
                </Col>
              </Row>
              <br/>
              <Row gutter={[16, 16]} style={{ marginBottom: "30px"}}>
                <Col>
                  <Input
                    placeholder="Enter city name..."
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="city-input"
                    style={{
                      backgroundColor: "rgba(5, 5, 5, 0.1)",
                      boxShadow: "none",
                      border: "none",
                    }}
                  />
                </Col>
                <Col span={4}>
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      boxShadow: "none",
                      border: "none",
                    }}
                    onClick={handleAddCity}
                  >
                    Add City
                  </Button>
                </Col>
              </Row>
              <Row gutter={[16, 20]}>
                {cities.map((city) => (
                  <Col xs={24} sm={24} md={6} lg={6} key={city.name}>
                    <Card
                      title={`${city.name}, ${city.country}`}
                      onClick={() => setSelectedCity(city)}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        boxShadow: "none",
                        border: "none",
                      }}
                    >
                      <p>
                        Current: {convertTemp(city.current.temp).toFixed(1)}°{" "}
                        {isCelsius ? "C" : "F"}
                      </p>
                      <p>Condition: {city.current.condition}</p>
                      <p>
                        High: {convertTemp(city.current.high).toFixed(1)}° |
                        Low: {convertTemp(city.current.low).toFixed(1)}°
                      </p>
                    </Card>

                    <Button
                      style={{ marginTop: "7px" }}
                      danger
                      onClick={() => handleRemoveCity(city)}
                    >
                      Remove
                    </Button>
                  </Col>
                ))}
              </Row>
            </>
          ) : (
            <>
              <Row
                justify="space-between"
                style={{ alignItems: "center", marginBottom: "15px" }}
              >
                <Col span={5}>
                  <Button
                    style={{
                      border: "none",
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                    }}
                    onClick={() => setSelectedCity(null)}
                    icon={<ArrowLeftOutlined />}
                  >
                    Back
                  </Button>
                </Col>

                <Col>
                  <Button
                    onClick={handleLogOut}
                    type="submit"
                    style={{
                      backgroundColor: "rgba(5, 5, 5, 0.1)",
                      boxShadow: "none",
                      border: "none",
                      // width: "8rem",
                    }}
                    icon={<LoginOutlined />}
                    size="medium"
                  >
                    Logout
                  </Button>
                </Col>
              </Row>

              <Row gutter={[16, 25]} style={{ marginBottom: "1rem" }}>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <Card
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      height: "100%",
                      //marginTop: "10px",
                    }}
                  >
                    <Row justify="end">
                      <Col>
                        <Switch
                          size="large"
                          checkedChildren={
                            <div style={{ color: "black" }}>°C</div>
                          }
                          unCheckedChildren={
                            <div style={{ color: "black" }}>°F</div>
                          }
                          checked={isCelsius}
                          onChange={() => setIsCelsius((prev) => !prev)}
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                          }}
                        />
                      </Col>
                    </Row>
                    <br />

                    <Col>
                      <div style={{ fontSize: "17px" }}>
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </div>
                      <div style={{ fontSize: "50px", fontWeight: "bold" }}>
                        {convertTemp(selectedCity.current.temp).toFixed(2)}°{" "}
                        {isCelsius ? "C" : "F"}
                      </div>
                      <div style={{ fontSize: "20px" }}>
                        {selectedCity.name} | {selectedCity.country}
                      </div>
                      <p style={{ fontSize: "20px", fontWeight: "bold" }}>
                        {selectedCity.current.condition}
                      </p>
                      <br />
                      <div
                        className="innercard"
                        style={{
                          border: "2px solid gray",
                          padding: "2rem",
                          borderRadius: "1rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "stretch",
                          gap: "2rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            flex: "1",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                          }}
                        >
                          {/* Weather Detail */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <img
                              style={{
                                borderRadius: "100%",
                                width: "40px",
                                height: "40px",
                              }}
                              src="https://img.icons8.com/?size=256&id=HwGBDTAiOecf&format=png"
                              alt="Weather Icon"
                            />
                            <div>
                              <div
                                style={{ fontSize: "18px", fontWeight: "bold" }}
                              >
                                Weather
                              </div>
                              <div>{selectedCity.current.condition}</div>
                            </div>
                          </div>
                          {/* Pressure Detail */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <img
                              style={{
                                borderRadius: "100%",
                                width: "40px",
                                height: "40px",
                              }}
                              src="https://img.icons8.com/?size=256&id=51497&format=png"
                              alt="Pressure Icon"
                            />
                            <div>
                              <div
                                style={{ fontSize: "18px", fontWeight: "bold" }}
                              >
                                Pressure
                              </div>
                              <div>{selectedCity.current.pressure} hPa</div>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            flex: "1",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                          }}
                        >
                          {/* Humidity Detail */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <img
                              style={{
                                borderRadius: "100%",
                                width: "40px",
                                height: "40px",
                              }}
                              src="https://img.icons8.com/?size=256&id=UjSURd7eHUYL&format=png"
                              alt="Humidity Icon"
                            />
                            <div>
                              <div
                                style={{ fontSize: "18px", fontWeight: "bold" }}
                              >
                                Humidity
                              </div>
                              <div>{selectedCity.current.humidity}%</div>
                            </div>
                          </div>
                          {/* Wind Speed Detail */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <img
                              style={{
                                borderRadius: "100%",
                                width: "40px",
                                height: "40px",
                              }}
                              src="https://img.icons8.com/?size=256&id=pLiaaoa41R9n&format=png"
                              alt="Wind Speed Icon"
                            />
                            <div>
                              <div
                                style={{ fontSize: "18px", fontWeight: "bold" }}
                              >
                                Wind Speed
                              </div>
                              <div>{selectedCity.current.windSpeed} m/s</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Card>
                </Col>

                <Col xs={24} sm={24} md={12} lg={12}>
                  <Card
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "25px",
                        color: "white",
                      }}
                    >
                      5 - Day Weather Forecast
                    </div>
                    <List
                      size="large"
                      bordered={false}
                      dataSource={selectedCity.forecast}
                      renderItem={(day) => (
                        <List.Item>
                          <Row>
                            <div
                              style={{ fontSize: "20px", fontWeight: "bold" }}
                            >
                              {day.date}:
                            </div>
                          </Row>
                          <Row>{convertTemp(day.temp).toFixed(1)}°</Row>
                          {isCelsius ? "C" : "F"} - {day.condition}
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>

              <Card
                title={
                  <div style={{ fontWeight: "bold", fontSize: "30px" }}>
                    Temperature trends
                  </div>
                }
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  height: "100%", // Ensure the card spans the full height
                }}
              >
                <Col xs={24} sm={24}>
                  <Line height="100" data={getGraphData(selectedCity)} />
                </Col>
              </Card>
            </>
          )}
        </Layout>
      </div>
    </>
  );
};

export default Weather;
