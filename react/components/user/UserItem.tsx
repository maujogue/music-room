import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack'
import { UserInfo } from '@/components/types/user.ts'

type UserItemProps = {
    info: UserInfo;
};


export default function UserItem({info}: UserItemProps) {

    return (
        <Card className="flex-row gap-2 p-2">
            <Text>Test = {info}</Text>
        </Card>
    )
}
