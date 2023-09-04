import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function App() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parameters, setParameters] = useState({
    origin: null,
    destination: null,
    date: null
  });

  useEffect(() => {
    if (parameters.origin && parameters.destination && parameters.date) {
      const fetchData = async () => {
        const formattedDate = parameters.date.toISOString().split('T')[0];
        const response = await fetch(`http://localhost:5000/search?origin=${parameters.origin}&destination=${parameters.destination}&date=${formattedDate}`);
        const data = await response.json();
        setData(data);
      };

      fetchData();
    }
  }, [parameters]);



  return (
    <div className="App">
      <div>
        <Button onClick={() => setParameters(prev => ({ ...prev, origin: 'SFO' }))} active={parameters.origin === 'SFO'}>SFO</Button>
        <Button onClick={() => setParameters(prev => ({ ...prev, origin: 'LAX' }))} active={parameters.origin === 'LAX'}>LAX</Button>
      </div>
      <div>
        <Button onClick={() => setParameters(prev => ({ ...prev, destination: 'NYC' }))} active={parameters.destination === 'NYC'}>NYC</Button>
        <Button onClick={() => setParameters(prev => ({ ...prev, destination: 'WAS' }))} active={parameters.destination === 'WAS'}>WAS</Button>
      </div>
      <div>
        <DatePicker selected={parameters.date} onChange={date => setParameters(prev => ({ ...prev, date }))} />
      </div>
      <div>
        <h3>Aggregated Data:</h3>
        {Object.entries(data).map(([date, values]) => (
          <div key={date}>
            <h4>{date}</h4>
            <p>Prices: {values.price.join(", ")}</p>
            <p>Fare Classes: {values.fare_classes.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
