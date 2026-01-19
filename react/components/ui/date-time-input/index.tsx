import React, { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { DateTime } from 'luxon';
import { Input, InputField } from '@/components/ui/input';
import { Box } from '@/components/ui/box';

type DateTimeInputProps = {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime';
};

/**
 * A unified DateTimePicker component that works "by default" on both platforms.
 * It displays an Input field that triggers the native picker.
 */
const DateTimeInput = ({
  value,
  onChange,
  placeholder = 'Choose date/time',
  mode = 'datetime',
}: DateTimeInputProps) => {
  const [show, setShow] = useState(false);
  // Android doesn't support 'datetime' mode natively in one go,
  // so we track which one we are showing.
  const [androidMode, setAndroidMode] = useState<'date' | 'time'>('date');

  const handlePress = () => {
    setAndroidMode('date');
    setShow(true);
  };

  const onValueChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }

    if (selectedDate) {
      if (
        Platform.OS === 'android' &&
        mode === 'datetime' &&
        androidMode === 'date'
      ) {
        // Date picked, now show time picker
        const newDate = new Date(value || new Date());
        newDate.setFullYear(selectedDate.getFullYear());
        newDate.setMonth(selectedDate.getMonth());
        newDate.setDate(selectedDate.getDate());

        onChange(newDate);
        setAndroidMode('time');
        // On Android, for the transition to work without unmounting and hitting the 'dismiss' bug,
        // we should ideally keep show true, but since we are changing 'androidMode' prop,
        // the DateTimePicker component will re-render.
        return;
      }

      // Final selection
      onChange(selectedDate);
    }

    // Close on Android after the final step (time or single mode)
    if (Platform.OS === 'android') {
      setShow(false);
    }
  };

  const displayDate = value
    ? DateTime.fromJSDate(value).toLocaleString(
        mode === 'datetime'
          ? DateTime.DATETIME_MED
          : mode === 'time'
            ? DateTime.TIME_SIMPLE
            : DateTime.DATE_MED
      )
    : '';

  return (
    <>
      <Pressable onPress={handlePress}>
        <Box pointerEvents='none'>
          <Input className='bg-neutral-50 mb-3 rounded-full border'>
            <InputField
              value={displayDate}
              placeholder={placeholder}
              editable={false}
            />
          </Input>
        </Box>
      </Pressable>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          // On Android, we force 'date' or 'time' to avoid the library's 'datetime' crash
          mode={Platform.OS === 'android' ? androidMode : mode}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onValueChange}
        />
      )}
    </>
  );
};

export default DateTimeInput;
