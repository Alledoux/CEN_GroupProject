import React, { useEffect, useState } from "react";
import axios from "axios";

const TestConnection = () => {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    axios.get("http://localhost:5000/api/tasks") // adjust route if needed
      .then((res) => {
        setMessage("✅ Connected! Got " + res.data.length + " tasks.");
      })
      .catch((err) => {
        setMessage("❌ Connection failed: " + err.message);
      });
  }, []);

  return <div>{message}</div>;
};

export default TestConnection;
