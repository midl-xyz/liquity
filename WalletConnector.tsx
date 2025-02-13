import React, { useState } from 'react';
import { Flex, Button, Box, Icon, Modal, List, ListItem } from 'theme-ui';
import { useAccounts, useConnect, AddressPurpose } from 'some-wallet-library';

export const WalletConnector: React.FC<WalletConnectorProps> = ({ children }) => {
  const { isConnected } = useAccounts();
  const { connectors, connect } = useConnect({
    purposes: [AddressPurpose.Ordinals]
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onConnect = (id: string) => {
    connect({ id });
    setIsModalOpen(false);
  };

  return isConnected ? (
    children
  ) : (
    <Flex sx={{ height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <Button onClick={() => setIsModalOpen(true)}>
        <Icon name="plug" size="lg" />
        <Box sx={{ ml: 2 }}>Connect wallet</Box>
      </Button>
      {isModalOpen && (
        <Modal>
          <List>
            {connectors.map((connector) => (
              <ListItem key={connector.id} onClick={() => onConnect(connector.id)}>
                {connector.name}
              </ListItem>
            ))}
          </List>
        </Modal>
      )}
    </Flex>
  );
};