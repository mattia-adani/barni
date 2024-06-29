// TemperatureGraphModal.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Container, Box  } from '@mui/material';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import moment from 'moment';
import 'chartjs-adapter-moment';
import axios from 'axios';
import { getToken, getUser } from '../utils/common.js';


const TemperatureGraphModal = ({ data, open, handleClose }) => {
  // Prepare data for the chart
  const chartData = {
    labels: data.map(entry => moment(entry.timestamp).toDate()),
    datasets: [
      {
        label: 'Temperature',
        data: data.map(entry => entry.temperature),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          tooltipFormat: 'MMM D, h:mm a',
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
        beginAtZero: false,
      },
    },
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Temperature Data</DialogTitle>
      <DialogContent>
        <Line data={chartData} options={chartOptions} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};



const TemperatureGraph = ({device}) => {
  // Sample temperature data
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {

    const url = process.env.REACT_APP_BACKEND_URL;
    const api = '/devices/temperature/';
    const request = { device: device };
    const options = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: getToken(),
        },
    };

    try {
        const response = await axios.post(`${url}${api}`, request, options);
        //const thisDevice = response.data.data;
    
      } catch (error) {
        console.log(error);
    } finally {
      setData([
        { timestamp: '2024-06-29T01:00:00Z', temperature: 22 },
        { timestamp: '2024-06-29T02:00:00Z', temperature: 23 },
        { timestamp: '2024-06-29T03:00:00Z', temperature: 21 },
        { timestamp: '2024-06-29T04:00:00Z', temperature: 24 },
        { timestamp: '2024-06-29T05:00:00Z', temperature: 20 },
        { timestamp: '2024-06-29T06:00:00Z', temperature: 25 },
      ])

    }

  }


  useEffect(() => {fetchData()}, [])

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Container>
      <Box display="flex" justifyContent="center" mt={5}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Temperature Graph
        </Button>
      </Box>

      <TemperatureGraphModal data={data} open={open} handleClose={handleClose} />
    </Container>
  );
};


export default TemperatureGraph;
