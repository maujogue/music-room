// Example — place where you manage beginningAt / endingAt in your form
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import DateTimePickerModal from '@react-native-community/datetimepicker';

const DateTimeInput = ({ value, onChange }) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Text>
          {value ? new Date(value).toLocaleString() : 'Choose date/time'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={visible}
        mode='datetime'
        onConfirm={date => {
          onChange(date.toISOString());
          setVisible(false);
        }}
        onCancel={() => setVisible(false)}
      />
    </>
  );
};

export default DateTimeInput;
