import React from 'react';
import {Svg, Image as ImageSvg, Defs, ClipPath, Circle} from 'react-native-svg';
import {View, Text} from 'react-native';
import {Callout} from 'react-native-maps';

const CustomCallout = ({navigation, routes, currentLocation, eta, bus}) => {
  const formatSpeed = speed => {
    const roundedSpeed = Math.round(Number(speed));
    return isNaN(roundedSpeed) ? 0 : roundedSpeed; // Return 0 if speed is invalid
  };

  const speed = formatSpeed(bus.details.speed);
  return (
    <Callout
      style={{alignItems: 'center'}}
      onPress={() => {
        console.log('press');
      }}>
      {bus.emergency_status && (
        <View>
          <Text style={{color: 'red', fontWeight: 'bold'}}>
            🚨 EMERGENCY: Active 🚨
          </Text>
        </View>
      )}
      <Text>Bus Number: {bus.details.bus_number}</Text>
      <Text>License Plate: {bus.details.license_plate}</Text>
      <Text>Seat Slots: {bus.details.seat_count} / 56</Text>
      <Text>
        Speed:{' '}
        {bus.emergency_status
          ? 'NOT AVAILABLE'
          : speed > 0
          ? `around ${speed} km/h`
          : `${speed} km/h`}
      </Text>
      <Text>
        ETA:{' '}
        {bus.emergency_status
          ? 'NOT AVAILABLE'
          : eta
          ? `${eta} minutes`
          : 'Not Available'}
      </Text>

      <Text>
        Last Update: {bus.details.timestamp.toDate().toLocaleString()}
      </Text>
      {/* 
      <View
        style={{
          backgroundColor: '#176B87',
          padding: 10,
          borderRadius: 5,
          marginVertical: 10,
          alignItems: 'center',
        }}>
        <Text style={{color: 'white'}}>Pay in Advance</Text>
      </View> */}
    </Callout>
  );
};

export default CustomCallout;
