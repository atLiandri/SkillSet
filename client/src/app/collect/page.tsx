"use client";
import { Footer } from "../../components/Footer";
import Layout from "../../components/Layout";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Arrow } from "../../components/icons";
import { VStack, HStack, Text, Card, Link as ChakraLink, Heading, Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "../../hooks/toast";
import { useWaitForTransactionReceipt, useWriteContract, useReadContract, useAccount } from 'wagmi';
import { abi } from "@/utils/abi";

// Simple regex for Ethereum address validation
const isValidEthereumAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

export default function New() {
  const { address } = useAccount();  // Get the connected wallet address
  const [currentIndex, setCurrentIndex] = useState(0);  // Track the current index for navigation
  const { toast } = useToast();  // Toast for notifications

  // Query the proposals for the connected wallet
  const { data: index } = useReadContract({
    address: '0xa15310D13b760fA214d2275f85bBDfCc12F63323',  // Replace with your contract address
    abi: abi, 
    functionName: 'getProposalsReceivedBy',
    args: [address],  // Use connected wallet address
  });

  // Ensure data is available and destructure the result
  const addressArray = index ? index[0] : [];  // index[0] is the address[] part
  const uint256Array = index ? index[1] : [];  // index[1] is the uint256[] part

  // Convert BigInt to string for display
  const currentValue = uint256Array.length > 0 ? uint256Array[currentIndex].toString() : '0';

  // Function to handle left navigation
  const handleLeftClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : addressArray.length - 1));
  };

  // Function to handle right navigation
  const handleRightClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex < addressArray.length - 1 ? prevIndex + 1 : 0));
  };

  // Wagmi hook for writing to the contract
  const { 
    data: transactionHash, 
    error: contractError, 
    isPending, 
    writeContract 
  } = useWriteContract({});

  // Waiting for the transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  // Handle the claim button click
  const handleClaim = async () => {
    try {
      writeContract({
        address: '0xa15310D13b760fA214d2275f85bBDfCc12F63323',  // Replace with your contract address
        abi: abi,
        functionName: 'confirmProposal',  // The function name in your contract
        args: [currentIndex],  // Pass the currentIndex to the contract function
      });

      // Show toast notification for transaction submission
      
    } catch (error) {
      toast({
        message: contractError?.message || "Error submitting the transaction",
        isError: true
      });
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      toast({
        message: "trasaction confirmed",
  
      });
    }

    if (contractError) {
      toast({
        message: contractError.message,
        isError: true
      });
    }
  }, [isConfirmed, contractError, toast]);

  return (
    <>
      <Layout
        isSinglePanel
        footer={
          // Hide the claim button if there is nothing to collect
          addressArray.length > 0 && (
            <Footer>
              <Button
                w="full"
                px={["auto", "20px"]}
                isLoading={isPending}
                onClick={handleClaim}  
                isDisabled={isPending || (!contractError && isConfirmed)} 
              >
                {isPending ? 'Processing...' : 'Claim'}
              </Button>
            </Footer>
          )
        }
      >
        <VStack h="full">
          <VStack>
            <Text textStyle="subheading" fontSize={["10px", "11px"]} letterSpacing="0.25em">
              Hey
            </Text>
            <Heading fontSize={["36px", "48px"]} fontWeight="400" textAlign="center">
            {address ? `${address.slice(0, 5)}...${address.slice(-6)}` : "skiller"}
            </Heading>
          </VStack>

          <VStack width="full" maxW="500px" h="100%" justifyContent="space-between">
            <VStack textAlign="center">
              {/* If there are no values, show "Nothing to collect" */}
              {addressArray.length === 0 ? (
                <Text color="red.400">Nothing to collect</Text>
              ) : (
                <>
                  <Heading > You have recived a Skill Certificate</Heading>
                  <Text color="yellow.400">Address: {addressArray[currentIndex]}</Text>
                  <Text color="yellow.400">Value: {currentValue}</Text>

                  {/* Show arrows only if there are multiple values */}
                  {addressArray.length > 1 && (
                    <HStack>
                      <Arrow
                        direction="left"
                        cursor="pointer"
                        boxSize="40px"
                        onClick={handleLeftClick}
                      />
                      <Arrow
                        direction="right"
                        cursor="pointer"
                        boxSize="40px"
                        onClick={handleRightClick}
                      />
                    </HStack>
                  )}
                </>
              )}
            </VStack>
          </VStack>

          {/* Display transaction hash with a link */}
          {transactionHash && (
            <ChakraLink href={`https://sepolia.etherscan.io/tx/${transactionHash}`} isExternal>
              View on Etherscan: {transactionHash}
            </ChakraLink>
          )}

          {/* Show confirmation message */}
          {isConfirming && <Text>Waiting for confirmation...</Text>}
          {isConfirmed && <Text color="green.400">Transaction confirmed!</Text>}

          <Box display="block" minH="70px" h="70px" w="full" />
        </VStack>
      </Layout>
    </>
  );
}