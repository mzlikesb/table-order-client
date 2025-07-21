import { useState } from "react";
import { useEffect } from "react";
import { TableConfig } from "~/utils/tableConfig";

export default function Standby() {
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    const config = TableConfig.getInstance();
    setTableNumber(config.getTableNumber());
  }, []);

  return <div>Table no. {tableNumber}</div>;
}