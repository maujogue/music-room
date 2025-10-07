import React, { useEffect } from 'react';
import { Text } from 'react-native';
import useServerSocket from '@/hooks/useServerSocket';
import { getSession } from '@/services/session';

export default function ServerSocketListener() {
  const session = getSession();
  const token = session?.access_token;
  const serverUrl = process.env.WS_SERVER_URL;

  const { connected, send } = useServerSocket(serverUrl, token, {
    onMessage: (msg) => {
      console.log('WS message', msg);
      // dispatcher dans ton store / navigation / toast selon type
    },
    onOpen: () => console.log('WS connected'),
    onClose: () => console.log('WS closed'),
    autoReconnect: true,
  });

  useEffect(() => {
    // exemple : demander au serveur de s'abonner à un événement précis
    // send({ type: 'subscribe', eventId: '<id>' })
  }, [send]);

  return <Text>{connected ? 'WS connecté' : 'WS déconnecté'}</Text>;
}
