import { useEffect, useState } from 'react';
import { ClientEntity } from '@shared/entities/ClientEntity';
import { getAuthData } from '../../utils/auth.utils';
import { handleEntityHook } from '@shared/hooks/handleEntityHook';

export const useAuthClientHook = () => {
  const authClient = getAuthData('all') as ClientEntity;
  const [client, setClient] = useState<ClientEntity>();
  const { item } = handleEntityHook<ClientEntity>('clients');

  useEffect(() => {
    if (authClient && !client) setClient(authClient);
  }, [authClient]);

  useEffect(() => {
    if (item && item._id) {
      setClient(item);
    }
  }, [item]);
  return {
    client,
  };
};
