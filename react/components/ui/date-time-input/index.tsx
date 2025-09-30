import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type DateTimeInputProps = {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
};

const DateTimeInput = ({ value, onChange, placeholder = 'Choose date/time' }: DateTimeInputProps) => {
  const [visible, setVisible] = React.useState(false);

  // Convert string to Date object, fallback to current date if empty
  const getDateValue = () => {
    if (!value || value === '') {
      return new Date();
    }
    return new Date(value);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 4,
          backgroundColor: '#fff'
        }}
      >
        <Text>
          {value && value !== '' ? new Date(value).toLocaleString() : placeholder}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={visible}
        mode="datetime"
        date={getDateValue()}
        onConfirm={(date) => {
          onChange(date.toISOString());
          setVisible(false);
        }}
        onCancel={() => setVisible(false)}
      />
    </>
  );
};

export default DateTimeInput;
