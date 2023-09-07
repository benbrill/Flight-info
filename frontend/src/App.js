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
  const [data2, setData2] = useState({});
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
        const endpoint1 = `http://localhost:5000/search/single_day?origin=${parameters.origin}&destination=${parameters.destination}&date=${formattedDate}`;
        const endpoint2 = `http://localhost:5000/search?origin=${parameters.origin}&destination=${parameters.destination}&date=${formattedDate}`;

        const [response1, response2] = await Promise.all([
          fetch(endpoint1),
          fetch(endpoint2)
        ]);

        // Parse the responses into JSON
        const [data1, data2] = await Promise.all([
          response1.json(),
          response2.json()
        ]);

        console.log(data1, data2);
        setData(data1);
        setData2(data2);
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
        <Button onClick={() => setParameters(prev => ({ ...prev, destination: 'SFO' }))} active={parameters.destination === 'SFO'}>SFO</Button>
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
      <div>
        <LineChart width={1000} height={500} data={data2}>
          <Line type="monotone" dataKey="UA" stroke="#8884d8" />
          <Line type="monotone" dataKey="NK" stroke="#8884d8" />
          <Line type="monotone" dataKey="AA" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="departure_date" />
          <YAxis />
          <Tooltip />
          <Legend />
        </LineChart>
      </div>
    </div>
  );
}

export default App;
