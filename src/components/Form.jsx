import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import { useUrlPositions } from "../hooks/useUrlPositions";
import Spinner from "./Spinner";
import Message from "./Message";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  // Ensure the countryCode is valid
  if (!countryCode || countryCode.length !== 2) {
    return "🌍"; // Return a globe emoji if the code is invalid
  }

  // Convert the country code to uppercase and map each character to the regional indicator symbol
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt()); // Adding 127397 gives the regional indicator code point

  return String.fromCodePoint(...codePoints); // Return the combined flag emoji
}

const BASE_URL2 = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  /* eslint-disable no-unused-vars */
  const [lat, lng] = useUrlPositions();
  const { createCity, isLoading } = useCities();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");

  const [emoji, setEmoji] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isLoadingGeoCoding, setIsLoadingGeoCoding] = useState(false);
  const [geoCodingError, setGeoCodingError] = useState("");
  const Navigate = useNavigate();

  useEffect(
    function () {
      if (!lat && !lng) return;
      async function fetchCityData() {
        try {
          setIsLoadingGeoCoding(true);
          setGeoCodingError("");

          const res = await fetch(
            `${BASE_URL2}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          console.log(data);
          if (!data.countryCode)
            throw new Error(
              "That doesn't seem to be a city. Click somewhere else"
            );
          setCityName(data.city || data.locality || "");
          setCountry(data.country || "");
          setEmoji(convertToEmoji(data.countryCode));
        } catch (err) {
          setGeoCodingError(Error);
        } finally {
          setIsLoadingGeoCoding(false);
        }
      }

      fetchCityData();
    },
    [lat, lng]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };

    await createCity(newCity);
    Navigate("/app/cities");
  }

  if (geoCodingError) return <Message message={geoCodingError} />;
  return (
    <>
      {isLoadingGeoCoding && <Spinner />}

      <Message message="Start by clicking somewhere on the map" />
      <form
        className={`${styles.form} ${isLoading ? styles.loading : ""}`}
        onSubmit={handleSubmit}
      >
        <div className={styles.row}>
          <label htmlFor="cityName">City name</label>
          <input
            id="cityName"
            onChange={(e) => setCityName(e.target.value)}
            value={cityName}
          />
          <span className={styles.flag}>{emoji}</span>
        </div>
        <div className={styles.row}>
          <label htmlFor="date">When did you go to {cityName}?</label>
          {/*<input
            id="date"
            onChange={(e) => setDate(e.target.value)}
            value={date}
          />*/}

          <DatePicker
            id="date"
            selected={date}
            onChange={(date) => setDate(date)}
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div className={styles.row}>
          <label htmlFor="notes">Notes about your trip to {cityName}</label>
          <textarea
            id="notes"
            onChange={(e) => setNotes(e.target.value)}
            value={notes}
          />
        </div>
        <div className={styles.buttons}>
          <Button type="primary"> Add </Button>
          <BackButton />
        </div>
      </form>
    </>
  );
}

export default Form;
