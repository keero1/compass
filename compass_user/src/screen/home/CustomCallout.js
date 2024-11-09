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
      <Svg width={120} height={120}>
        <Defs>
          <ClipPath id="clip">
            <Circle cx="50%" cy="50%" r="40%" />
          </ClipPath>
        </Defs>
        <ImageSvg
          width={120}
          height={120}
          preserveAspectRatio="xMidYMid slice"
          href={bus.details.profile_picture}
          clipPath="url(#clip)"
        />
      </Svg>
      <Text>Driver Name: {bus.details.name}</Text>
      {bus.details.conductor_name && (
        <Text>Conductor Name: {bus.details.conductor_name}</Text>
      )}
      <Text>License Plate: {bus.details.license_plate}</Text>
      <Text>Seat Slots: {bus.details.seat_count} / 56</Text>
      <Text>Speed: {speed > 0 ? `around ${speed} km/h` : `${speed} km/h`}</Text>
      <Text>ETA: {eta ? `${eta} minutes` : 'Not Available'}</Text>
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
