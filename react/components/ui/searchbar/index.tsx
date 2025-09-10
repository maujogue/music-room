import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SearchIcon } from '@/components/ui/icon';

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSubmit?: () => void;
};

export function SearchBar({ value, onChange, onSubmit }: Props) {
  return (
    <Input>
      <InputSlot className='pl-3'>
        <InputIcon as={SearchIcon} />
      </InputSlot>
      <InputField
        placeholder='Search...'
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
      />
    </Input>
  );
}
