import { useEffect, useState } from "react";

export default function Time() {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h2>{dateTime.toLocaleDateString()}</h2>
            <h2>{dateTime.toLocaleTimeString()}</h2>
        </div>
    );
}