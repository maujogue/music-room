import { useState } from 'react'
import { StyleSheet, TextInput } from 'react-native';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SearchIcon } from '@/components/ui/icon';

type Props = {
  value: string;
  onChange?: (text: string) => void;
  onSubmit?: (text: string) => void;
  onChangeText?: (text: string) => void;
};

export function SearchBar({ value, onChange, onSubmit, onChangeText }: Props) {
  const [searchText, setSearchText] = useState('')

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onChange?.(text);
    onChangeText?.(text);
  };

  const handleSearchSubmit = () => {
    onSubmit?.(searchText);
  };

  return (
    <Input>
      <InputSlot className="pl-3">
        <InputIcon as={SearchIcon} />
      </InputSlot>
      <InputField
        placeholder="Search..."
        value={searchText}
        onChangeText={handleSearchChange}
        onSubmitEditing={handleSearchSubmit}
      />
    </Input>
  );
}
