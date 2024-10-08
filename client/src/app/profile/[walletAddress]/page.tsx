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
  Input, // Import Input for search bar
} from '@chakra-ui/react';
import Layout from "../../../components/Layout";
import { Footer } from "../../../components/Footer";
import Button from "../../../components/Button";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { Bag, DollarBag, Event, Clock } from "../../../components/icons";
import { ProfileButton } from "../../../components/ProfileButton";  // Import Profile component
import { useAccount } from 'wagmi'; // Import useAccount for connected wallet
import { useToast } from "@/hooks/toast";
import { decodeAttestationData } from '@/utils/decoders'; 

// Group attestations by date
const groupAttestationsByDate = (attestations) => {
    const grouped = {};
  
    attestations.forEach(attestation => {
      const date = format(new Date(Number(attestation.syncAt)), 'PP'); // Format date as a headline
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(attestation);
    });
  
    return grouped;
};

const getSkillLevelDescription = (totalInteractions) => {
    if (totalInteractions == 0) return { level: "Blank Slate", description: "Expert at absolutely nothing!" };
    if (totalInteractions <= 10) return { level: "Skill Seedling", description: "The journey begins." };
    if (totalInteractions <= 20) return { level: "Apprentice Adventurer", description: "Unlocking new potential." };
    if (totalInteractions <= 30) return { level: "Curious Wanderer", description: "Boundless curiosity ahead." };
    if (totalInteractions <= 40) return { level: "Skill Scout", description: "Discovering hidden talents." };
    if (totalInteractions <= 50) return { level: "Rising Talent", description: "On the path to greatness." };
    if (totalInteractions <= 60) return { level: "Jack/Jill of Trades", description: "A versatile force." };
    if (totalInteractions <= 70) return { level: "Proficient Pathfinder", description: "Forging new horizons." };
    if (totalInteractions <= 80) return { level: "Master Craftsman", description: "Shaping brilliance with skill." };
    if (totalInteractions <= 90) return { level: "Skill Sage", description: "Wisdom in every move." };
    return { level: "Ultimate Polymath", description: "Master of infinite possibility." };
};

// Line component for individual attestations
const Line = ({ icon, text, link, color = "neon.400", iconColor = "neon.400" }) => {
  return (
    <ListItem w="full" py="6px" borderBottom="solid 1px" mt="6px" fontSize={["12px", "16px"]}>
      <HStack w="full" justify="space-between">
        <HStack flex="4" color={color}>
          <Box w="30px">{icon && <Box as={icon} boxSize="24px" color={iconColor} />}</Box>
          <Text>{text}</Text>
        </HStack>
        <ChakraLink href={link} isExternal color="blue.500" textDecoration="underline">
          View
        </ChakraLink>
      </HStack>
    </ListItem>
  );
};

// Fetch attestations from the IndexService API
const getAttestationListFromIndexService = async () => {
  const indexService = new IndexService("testnet");
  const res = await indexService.queryAttestationList({ schemaId: "onchain_evm_11155111_0x10f", page: 1 });
  return res.rows;
};

export default function ProfilePage({ params }) {
  const { walletAddress } = params;
  const [attestations, setAttestations] = useState([]);
  const [attestedCount, setAttestedCount] = useState(0); // For counting attestations created
  const [receivedCount, setReceivedCount] = useState(0); // For counting attestations received
  const { address } = useAccount(); // Connected wallet address
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [searchProfile, setSearchProfile] = useState('');
  const router = useRouter();
  const listRef = useRef(null);
  const { toast } = useToast();

  // Validate the wallet address format
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(walletAddress);

  // Filter function for search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (/^0x[a-fA-F0-9]{40}$/.test(searchProfile)) {
        router.push(`/profile/${searchProfile}`);
      } else {
        toast({
            message: "Please enter a valid Ethereum address.",
            isError: true
          });
      }
    }
  };

  // Filter attestations based on search query1
  const filteredAttestations = attestations.filter(attestation =>
    attestation.attestationId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAttestationListFromIndexService();
        const decodedData = data.map(attestation => ({
          ...attestation,
          decoded: decodeAttestationData(attestation.data)
        }));

        // Filter attestations where the wallet is either the attester or in recipients
        const filteredData = decodedData.filter(attestation =>
          attestation.decoded.addressIssuer.toLowerCase() === walletAddress.toLowerCase() ||
          attestation.decoded.addressReceiver.toLowerCase() === walletAddress.toLowerCase()
        );

        // Sort by syncAt descending
        filteredData.sort((a, b) => Number(b.syncAt) - Number(a.syncAt));

        setAttestations(filteredData);

        // Calculate attestations made and received
        const attested = filteredData.filter(
          attestation => attestation.decoded.addressIssuer.toLowerCase() === walletAddress.toLowerCase()
        );
        const received = filteredData.filter(
          attestation => attestation.decoded.addressReceiver.toLowerCase() === walletAddress.toLowerCase()
        );

        setAttestedCount(attested.length);
        setReceivedCount(received.length);
      } catch (error) {
        console.error("Error fetching attestations:", error);
      }
    };

    if (isValidAddress) {
      fetchData();
    }
  }, [walletAddress, isValidAddress]);

  // Scroll to the bottom on new attestations
  useEffect(() => {
    if (!listRef.current) return;
    const lastEl = listRef.current.lastElementChild;
    lastEl && lastEl.scrollIntoView({ behavior: "smooth" });
  }, [attestations]);

  if (!isValidAddress) {
    notFound();
  }

  const groupedAttestations = groupAttestationsByDate(filteredAttestations);

  return (
    
    <Layout
      CustomLeftPanel={() => (
        <CustomLeftPanel
          walletAddress={walletAddress}
          attestedCount={attestedCount}
          receivedCount={receivedCount}
        />
      )}
      footer={
        <Footer>
          <Button
            w={["full", "auto"]}
            px={["auto", "20px"]}
            onClick={() => router.push("/")}
          >
            Home
          </Button>
        </Footer>
      }
    >
      {/* Render search bar only if the connected wallet is different from the page wallet */}
      {address?.toLowerCase() !== walletAddress.toLowerCase() && (
        <Box w="full" mb={4} p={4}>
          <Input
            placeholder="Search profile by wallet address..."
            value={searchProfile}
            onChange={(e) => setSearchProfile(e.target.value)}
            onKeyDown={handleKeyDown} // Search when Enter is pressed
          />
        </Box>
      )}

      <VStack w="full" align="start" spacing={4} ref={listRef} p={4}>
        <Heading size="lg">Interaction History</Heading>

        {filteredAttestations.length > 0 ? (
          <List w="full">
            {Object.keys(groupedAttestations).map(date => (
              <VStack key={date} align="start" spacing={2} w="full">
                {/* Date headline */}
                <HStack w="full" alignItems="center">
                  <Box as={Clock} boxSize="24px" color="green.500" />
                  <Text fontSize="lg" color="green.500" textTransform="uppercase">
                    {date}
                  </Text>
                </HStack>

                {/* Render events for that date */}
                {groupedAttestations[date].map((attestation, index) => {
                  const isAttester = attestation.from.toLowerCase() === walletAddress.toLowerCase();
                  return (
                    <Line
                      key={`${attestation.id}-${index}`}
                      icon={isAttester ? DollarBag : Event}
                      text={isAttester ? `Received attestation: ${attestation.decoded.info}` : `Attested: ${attestation.decoded.info}`}
                      link={`https://testnet-scan.sign.global/attestation/${attestation.id}`}
                      color={isAttester ? "yellow.400" : "blue.400"}
                      iconColor={isAttester ? "yellow.400" : "blue.400"}
                    />
                  );
                })}
              </VStack>
            ))}
          </List>
        ) : (
          <Text>No attestations found for this address.</Text>
        )}
      </VStack>
    </Layout>
  );
}

// CustomLeftPanel with Profile Component
const CustomLeftPanel = ({ walletAddress, attestedCount, receivedCount }) => {
  const totalInteractions = attestedCount + receivedCount;  // Total number of interactions
  const { level, description } = getSkillLevelDescription(totalInteractions);  // Determine the skill level and description

  return (
    <VStack w="full" h="full" justifyContent="center" alignItems="center" flex="1">
      <Heading fontSize={["36px", "48px"]} fontWeight="400" mb={["0px", "20px"]}>
      {level}
      </Heading>
      {/* Profile component showing wallet address and attestation stats */}
      <ProfileButton
        walletAddress={walletAddress}
        attestedCount={attestedCount}
        receivedCount={receivedCount}
      />
    </VStack>
  );
};
