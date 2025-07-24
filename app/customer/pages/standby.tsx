import { useState, useEffect } from "react";
import { TableConfig } from "~/utils/tableConfig";

export default function Standby() {
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    const config = TableConfig.getInstance();
    setTableNumber(config.getTableNumber());
  }, []);

  return (
    <div>
      <h1>Table Order System</h1>
      <p>Table Number: {tableNumber}</p>
    </div>
  );
}