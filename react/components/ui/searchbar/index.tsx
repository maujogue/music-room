import { useState } from 'react'
import { StyleSheet, TextInput } from 'react-native';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SearchIcon } from '@/components/ui/icon';

type Props = {
  onChange?: (text: string) => void;
  onSubmit?: (text: string) => void; // Passe la valeur actuelle
};

export function SearchBar({ onChange, onSubmit }: Props) {
  const [searchText, setSearchText] = useState('')

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleSearchSubmit = () => {
    onSubmit?.(searchText);
    console.log('Recherche soumise:', searchText);
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
