import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';

type Props = {
    value: boolean;
    onToggle: () => void;
    leading?: React.ReactNode;
    label: string;
    helper?: string;
};

export default function SwitchRow({
    value,
    onToggle,
    leading,
    label,
    helper,
}: Props) {
    return (
        <VStack>
            <HStack className='items-center gap-8'>
                <Switch
                    trackColor={{ false: '#d4d4d4', true: '#000000' }}
                    thumbColor='#FFFFFF'
                    ios_backgroundColor='#d4d4d4'
                    value={value}
                    onToggle={onToggle}
                />
                <HStack className='items-center'>
                    {leading}
                    <Text className='pl-2'>{label}</Text>
                </HStack>
            </HStack>
            {helper ? (
                <Text size='sm' className='text-neutral-500 mt-1'>
                    {helper}
                </Text>
            ) : null}
        </VStack>
    );
}
