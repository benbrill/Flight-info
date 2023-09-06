import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import AirlineFlexbox from './components/flightcard'

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
        const response = await fetch(`http://localhost:5000/search/single_day?origin=${parameters.origin}&destination=${parameters.destination}&date=${formattedDate}`);
        const data = await response.json();
        console.log(data);
        setData(data);
        setLoading(false);
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
        <LineChart width={600} height={300} data={data[0]}> 
          <Line type="monotone" dataKey="UA" stroke="#8884d8" />
          <Line type="monotone" dataKey="NK" stroke="#8884d8" />
          <Line type="monotone" dataKey="AA" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
        </LineChart>
      </div>
      <div>
        {loading ? <p>Loading...</p> : <AirlineFlexbox data={data[1]} />}
      </div>
    </div>
  );
}

export default App;
