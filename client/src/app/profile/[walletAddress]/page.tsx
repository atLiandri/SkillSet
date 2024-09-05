"use client";

import { notFound } from 'next/navigation';
import { IndexService } from '@ethsign/sp-sdk';
import { useEffect, useState, useRef } from 'react';
import {
  VStack,
  HStack,
  Heading,
  Text,
  List,
  ListItem,
  Box,
  Link as ChakraLink,
  Tooltip,
} from '@chakra-ui/react';
import Layout from "@/components/Layout";
import { Footer } from "@/components/Footer";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';

// Icons (You can replace these with actual icon components)
import { FaCheckCircle, FaInbox } from 'react-icons/fa';
import { Bag, DollarBag, Event } from "@/components/icons";

// Line Component similar to the one in Logs page
const Line = ({
  icon,
  text,
  attestationId,
  time,
  link,
  color = "neon.400",
  iconColor = "neon.400",
}) => {
  return (
    <ListItem w="full" py="6px" borderBottom="solid 1px" mt="6px" fontSize={["12px", "16px"]}>
      <HStack w="full">
        <HStack flex="4" color={color}>
          <Box w="30px">{icon && <Box as={icon} boxSize="24px" color={iconColor} />}</Box>
          <Text>{text}</Text>
        </HStack>

        <Text flex="3" textAlign="right" color="gray.500" fontSize="sm">
          {format(new Date(Number(time)), 'PPpp')}
        </Text>

        <ChakraLink href={link} isExternal color="blue.500" textDecoration="underline">
          View
        </ChakraLink>
      </HStack>
    </ListItem>
  );
};

const getAttestationListFromIndexService = async () => {
  const indexService = new IndexService("testnet");
  const res = await indexService.queryAttestationList({ schemaId: "onchain_evm_11155111_0xa9", page: 1 });
  return res.rows;
};

export default function ProfilePage({ params }) {
  const { walletAddress } = params;
  const [attestations, setAttestations] = useState([]);
  const router = useRouter();
  const listRef = useRef(null);

  // Validate the wallet address format
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(walletAddress);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAttestationListFromIndexService();

        // Filter to show all attestations where the wallet is either the attester or in recipients
        const filteredData = data.filter(attestation =>
          attestation.attester.toLowerCase() === walletAddress.toLowerCase() ||
          attestation.recipients.some(recipient => recipient.toLowerCase() === walletAddress.toLowerCase())
        );

        // Sort by syncAt descending
        filteredData.sort((a, b) => Number(b.syncAt) - Number(a.syncAt));

        setAttestations(filteredData);
      } catch (error) {
        console.error("Error fetching attestations:", error);
      }
    };

    if (isValidAddress) {
      fetchData();
    }
  }, [walletAddress, isValidAddress]);

  // Scroll to bottom on new attestations
  useEffect(() => {
    if (!listRef.current) return;
    const lastEl = listRef.current.lastElementChild;
    lastEl && lastEl.scrollIntoView({ behavior: "smooth" });
  }, [attestations]);

  if (!isValidAddress) {
    notFound();
  }

  return (
    <Layout
      CustomLeftPanel={CustomLeftPanel}
      footer={
        <Footer>
          <Button
            w={["full", "auto"]}
            px={["auto", "20px"]}
            onClick={() => router.back()}
          >
            Back
          </Button>
        </Footer>
      }
    >
      <VStack w="full" align="start" spacing={4} ref={listRef} p={4}>
        <Heading size="lg">Wallet Interaction History</Heading>
        <Text>Wallet Address: {walletAddress}</Text>

        {attestations.length > 0 ? (
          <List w="full">
            {attestations.map(attestation => {
              const isAttester = attestation.attester.toLowerCase() === walletAddress.toLowerCase();
              const attestationMessage = isAttester
                ? `Attested: ${attestation.attestationId}`
                : `Received attestation: ${attestation.attestationId}`;

              return (
                isAttester
                  ? renderAttester(attestation, walletAddress)
                  : renderReceived(attestation, walletAddress)
              );
            })}
          </List>
        ) : (
          <Text>No attestations found for this address.</Text>
        )}
      </VStack>
    </Layout>
  );
}

const CustomLeftPanel = () => {
  return (
    <VStack w="full" h="full" justifyContent="center" alignItems="center" flex="1">
      <Heading fontSize={["36px", "48px"]} fontWeight="400" mb={["0px", "20px"]}>
        Wallet Profile
      </Heading>
      {/* You can add a Profile component or any other relevant component here */}
      {/* Example: <Profile /> */}
    </VStack>
  );
};

// Render function for attestations where the wallet is the attester
const renderAttester = (attestation, walletAddress) => {
  return (
    <Line
      key={attestation.id}
      icon={DollarBag} // Replace with actual icon if available
      text={`Attested: ${attestation.attestationId}`}
      attestationId={attestation.attestationId}
      time={attestation.syncAt}
      link={`https://testnet-scan.sign.global/attestation/${attestation.id}`}
      color="green.400" // Similar to WorldEvents.Bought
      iconColor="green.400"
    />
  );
};

// Render function for attestations where the wallet is a recipient
const renderReceived = (attestation, walletAddress) => {
  return (
    <Line
      key={attestation.id}
      icon={Event} // Replace with actual icon if available
      text={`Received attestation: ${attestation.attestationId}`}
      attestationId={attestation.attestationId}
      time={attestation.syncAt}
      link={`https://testnet-scan.sign.global/attestation/${attestation.id}`}
      color="blue.400" // Similar to WorldEvents.BoughtItem
      iconColor="blue.400"
    />
  );
};
