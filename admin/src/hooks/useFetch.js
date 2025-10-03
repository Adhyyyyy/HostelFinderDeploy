import { useEffect, useState } from "react";
import axios from "../axios";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Store the error message

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(url);
        // Handle both wrapped and raw response formats
        const responseData = res.data.data !== undefined ? res.data.data : res.data;
        setData(responseData);
      } catch (err) {
        setError(err.response ? err.response.data.message : "Something went wrong");
      }
      setLoading(false);
    };

    fetchData();
  }, [url]);

  const reFetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(url);
      // Handle both wrapped and raw response formats
      const responseData = res.data.data !== undefined ? res.data.data : res.data;
      setData(responseData);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Something went wrong");
    }
    setLoading(false);
  };

  return { data, loading, error, reFetch };
};

export default useFetch;
