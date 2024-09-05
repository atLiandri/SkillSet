import {
  Text,
  VStack,
  HStack,
  Divider,
  Card,
  Heading,
  Box,
} from "@chakra-ui/react";
import Button from "@/components/Button";
import { Calendar, Cigarette } from "./icons/archive"; 
import { useToast } from "@/hooks/toast";
import { useAccount, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains'

// Helper function to format the wallet address
const formatWalletAddress = (walletAddress) => {
  if (!walletAddress || walletAddress.length <= 14) return walletAddress;
  const firstPart = walletAddress.slice(0, 7);
  const lastPart = walletAddress.slice(-7);
  return `${firstPart}...${lastPart}`;
};

// Profile component that uses wallet address and attestation counts
export const ProfileButton = ({ walletAddress, attestedCount, receivedCount, ...props }) => {
  console.log(walletAddress)
  const { address } = useAccount();  // Get the connected wallet address
  const {  data: ensName } = useEnsName({ address: walletAddress , chainId: mainnet.id , universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376' });  // Get the ENS name for the wallet address
  const { toast } = useToast();
  console.log("ensName", ensName)

  const isSameAddress = address?.toLowerCase() === walletAddress.toLowerCase();  // Check if the connected account matches the profile's wallet address

  return (
    <VStack w="full" {...props}>
      <VStack w="full" maxW="380px" my="auto" pb={[0, "30px"]}>
        <Box w="full" justifyContent="center">
          <VStack w="full">
            <HStack w="full" fontSize="14px">
              <Card w="100px" alignItems="center">
                {/* Add an avatar or icon if needed */}
              </Card>
              <Card flex={2}>
                <HStack h="50px" px="10px">
                  <Calendar /> {/* Calendar icon */}
                  <Heading fontFamily="dos-vga" fontWeight="normal" fontSize={"16px"}>
                    <Text>{ensName ? ensName : formatWalletAddress(walletAddress)}</Text> {/* Display ENS name or formatted wallet address */}
                  </Heading>
                </HStack>

                <Divider
                  orientation="horizontal"
                  w="full"
                  borderTopWidth="1px"
                  borderBottomWidth="1px"
                  borderColor="neon.600"
                />
                <HStack h="50px" px="10px">
                  <Cigarette /> <Text>Profile</Text> {/* Static profile description */}
                </HStack>
              </Card>
            </HStack>

            {/* Display attestation stats */}
            <Card w="full">
              <HStack w="full" alignItems="center" justify="space-evenly" h="40px" fontSize="12px">
                <HStack flex="1" justify="center" color="yellow.400">
                  <Text opacity={0.5}>Attested:</Text>
                  <Text>{attestedCount}</Text> {/* Number of attestations made */}
                </HStack>

                <HStack flex="1" justify="center" color="blue.400">
                  <Text opacity={0.5}>Received:</Text>
                  <Text>{receivedCount}</Text> {/* Number of attestations received */}
                </HStack>
              </HStack>
            </Card>
          </VStack>
        </Box>

        <Box w="full" justifyContent="center" py={["10px", "30px"]}>
          <HStack w="full">
            {/* If the connected account matches the wallet address, show "Create" and "Collect" buttons */}
            {isSameAddress ? (
              <>
                <Button
                  variant="pixelated"
                  w="full"
                  onClick={() => {
                    window.location.href = "/create";  // Redirect to the create page
                  }}
                >
                  Create
                </Button>

                <Button
                  variant="pixelated"
                  w="full"
                  onClick={() => {
                    window.location.href = "/collect";  // Redirect to the collect page
                  }}
                >
                  Collect
                </Button>
              </>
            ) : (
              // If the connected account doesn't match, show the "Copy Link" button
              <Button
                variant="pixelated"
                w="full"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/profile/${walletAddress}`);
                  toast({
                    message: "Copied to clipboard",
                  });
                }}
              >
                Copy Link
              </Button>
            )}
          </HStack>
        </Box>
      </VStack>
    </VStack>
  );
};
