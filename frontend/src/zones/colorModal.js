import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import axios from 'axios';
import { getToken, getUser } from '../utils/common';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%', // Adjust width as needed
  maxHeight: '80vh', // Set maximum height
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto', // Enable vertical scrolling
};


const Color = props => {

  const data = props.data;
  const device = props.device;
  
  function setColor() {

//    console.log(device, data.red, data.green, data.blue)

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const api = '/zones/test/';
    const token = getToken();
    const user = getUser();

    const request =
      {
        username: user.username,
        device: device,
        type: 'RGBW',
        action: 'color',
        value: [data.red, data.green, data.blue]
    };

//    console.log(request, data.hex, data.color_name)
    
    props.setColorName(data.color_name)
    props.setColorHEX(data.hex)
    props.setButtonStyle({backgroundColor: data.hex, color: data.luma < 50 ? 'white' : 'black'})

    axios
        .post(
            `${backendUrl}${api}`,
            request,
            {
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            }
        )
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        })
        .finally(() => {
        });
    };



  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-2">
      <div 
        className="panel border border-2 m-1"
        style = {{
          backgroundColor: data.hex,
          display: 'flex',            // Enable flexbox
          justifyContent: 'center',   // Center horizontally
          alignItems: 'center',       // Center vertically
          color: (data.luma < 50) ? 'white' :  'black'
        }}
        onClick = {setColor} 
      >
        {data.color_name}
      </div>
    </div>
  );
};

const Group = props => {
  const data = props.data;
  const device = props.device;

  if (!(props.activeGroup === data.color_group)) return <></>;
  return (
    <>
      <div className="row">
        {/*<div className="col-12">
          <div className="panel border border-2 bg-primary" style={{ color: 'white' }}>
            {data.color_group}
          </div>
        </div>*/}
      </div>
      <div className="row">
        {data.colors.map((color) => (
          <Color key={color.hex} data={color} device = {device} setColorName={props.setColorName} setColorHEX={props.setColorHEX} setButtonStyle={props.setButtonStyle}/>
        ))}
      </div>
    </>
  );
};

export default function RGBWColorModal(props) {
  
  const device = props.device


  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [colors, setColors] = useState([]);
  const [activeGroup, setActiveGroup] = useState('');
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [currentRGB, setCurrentRGB] = useState(JSON.parse(device.color.replaceAll("None", "null"))[0]);
  const [colorHEX, setColorHEX] = useState('#000000');
  const [colorName, setColorName] = useState('off');
  const [buttonStyle, setButtonStyle] = useState({
    backgroundColor: '#000000',
    color: 'white'
  });

  
//  console.log(currentRGB)

  const fetchColors = async () => {
    try {
      setLoading(true);
      const url = process.env.REACT_APP_BACKEND_URL;
      const api = '/zones/colors/';
      const request = {};
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken(),
        },
      };

      axios.post(`${url}${api}`, request, options)
        .then(response => {
          setLoading(false);
          setColors(response.data.data);
//          console.log("COLORS", response.data.data);
        })
        .catch(error => {
          setLoading(false);
          console.log(error);
        });
    } catch (error) {
      console.log('Error fetching data: ' + error);
    } finally {
      setLoading(false);
    }
  };


  const fetchRGBColor = async () => {
    try {

      const url = process.env.REACT_APP_BACKEND_URL;
      const api = '/zones/RGBcolor/';
      const request = {
        red: currentRGB[0],
        green: currentRGB[1],
        blue: currentRGB[2],
      };

      console.log(request)
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getToken(),
        },
      };

      axios.post(`${url}${api}`, request, options)
        .then(response => {
          setColorName(response.data.data.color_name);
          setButtonStyle({backgroundColor: response.data.data.hex, color: response.data.data.luma < 50 ? 'white' : 'black'})
          console.log(colorHEX, response.data.data.hex);
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log('Error fetching data: ' + error);
    } finally {
    }
  };

  useEffect(() => { fetchRGBColor() }, []);
  //useEffect(() => { fetchRGBColor() }, [currentRGB]);

  useEffect(() => { fetchColors() }, []);

  return (
    <div>
      <Button className = 'mb-1' style={buttonStyle} onClick={handleOpen}>{colorName}</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
          <div className='container'>
            <div className='row'>
              {colors.map((group) => (
                <div key={group.color_group} className='col-12 col-sm-6 col-md-3 col-lg-1'>
                  <div
                    className='btn m-1 border border-1'
                    onClick={() => { setActiveGroup(group.color_group) }}
                    style={{
                      backgroundColor: group.color_group === activeGroup ? 'black' : 'white',
                      color: group.color_group === activeGroup ? 'white' : 'black'
                    }}
                  >
                    {group.color_group}
                  </div>
                </div>
              ))}
            </div>
            {colors.map((group) => (
              <Group key={group.color_group} data={group} device = {device.device} activeGroup={activeGroup} setColorName={setColorName} setColorHEX={setColorHEX} setButtonStyle={setButtonStyle}/>
            ))}
          </div>
        </Box>
      </Modal>
    </div>
  );
}
