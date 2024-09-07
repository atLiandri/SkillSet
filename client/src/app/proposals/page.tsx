"use client"
import { Footer } from "../../components/Footer";
import Layout from "../../components/Layout";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Alert, Arrow } from "../../components/icons";
import { InputNumber } from "../../components/InputNumber";
import { VStack, HStack, Text, Card, Link as ChakraLink } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState, useEffect  } from "react";
import { useToast } from "../../hooks/toast";
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { abi } from "@/utils/abi";

// Simple regex for Ethereum address validation
const isValidEthereumAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

export default function New() {
  const router = useRouter();
  const { toast } = useToast();

  const [error, setError] = useState("");
  const [ethAddress, setEthAddress] = useState(""); // Ethereum address field
  const [level, setLevel] = useState(0); // Level field
  const [maxLevel, setMaxLevel] = useState(0); // Max level field
  const [additionalInfo, setAdditionalInfo] = useState(""); // Additional info field
  const [avatarId, setAvatarId] = useState(0); // Dummy avatar ID
  const [addressReceiver, setAddressReceiver] = useState("");
  const [infoA, setInfoA] = useState("");

// Wagmi hooks to interact with the contract
const { 
  data: transactionHash, 
  error: contractError, 
  isPending, 
  writeContract 
} = useWriteContract();

const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
  hash: transactionHash,
});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate Ethereum address
    if (!isValidEthereumAddress(addressReceiver)) {
      setError("Invalid Ethereum address!");
      toast({
        message: "Please enter a valid Ethereum address.",
        isError: true
      });
      return;
    }

    // Validate levels
    if (level <= 0 || maxLevel <= 0) {
      setError("Level and Max Level must be positive numbers!");
      toast({
        message: "Level and Max Level must be positive numbers!",
        isError: true
      });
      return;
    }

    if (level > maxLevel) {
      setError("Level cannot be greater than Max Level!");
      toast({
        message: "Level cannot be greater than Max Level!",
        isError: true
      });
      return;
    }

    try {
      // Call a function to handle the collected data
      writeContract({
        address: '0xa15310D13b760fA214d2275f85bBDfCc12F63323', // Replace with your contract address
        abi,
        functionName: 'submitCertificateProposal',
        args: [addressReceiver, level, maxLevel, infoA],
      });

      // toast({
      //   message: "Data Submitted!",
      //   icon: Alert,
      // });

      // // Navigate after successful submission
      // router.push(`/next-page`);
    } catch (e) {
      console.error("Error submitting to contract: ", e);
      setError("An error occurred while submitting.");
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

  // if (contractError){
  
  // }

  // if (isConfirmed){
   
  // }

  return (
    <Layout
      leftPanelProps={{
        prefixTitle: "Creat a",
        title: "New Certificate",
        imageSrc: "/images/will-smith-with-attitude.png",
      }}
      footer={
        <Footer>
          <Button w={["full", "auto"]} px={["auto", "20px"]} onClick={handleSubmit} isLoading={isPending}>
            Submit
          </Button>
        </Footer>
      }
    >
      <VStack w={["full", "440px"]} margin="auto">
        <VStack w="full">
          <HStack my="30px" align="center" justify="center">
            {/* <Arrow
              style="outline"
              direction="left"
              boxSize="48px"
              userSelect="none"
              cursor="pointer"
              onClick={() => {
                avatarId > 1 ? setAvatarId(avatarId - 1) : setAvatarId(3); // Dummy avatar handling
              }}
            /> */}

              {/* <Card mx="90px">
                <Text>Certificate details </Text> 
              </Card> */}
              <Text>Certificate details </Text> 

            {/* <Arrow
              style="outline"
              direction="right"
              boxSize="48px"
              userSelect="none"
              cursor="pointer"
              onClick={() => {
                setAvatarId((avatarId + 1) % 4); // Dummy avatar handling with a total of 4 avatars
              }}
            /> */}
          </HStack>

          {/* Additional Information Input */}
          <Input
            display="flex"
            mx="auto"
            maxW="440px"
            placeholder="Skill information"
            value={infoA}
            onChange={(e) => setInfoA(e.target.value)}
          />

          {/* Ethereum Address Input */}
          <Input
            display="flex"
            mx="auto"
            maxW="440px"
            placeholder="Enter Ethereum address: 0x..."
            value={addressReceiver}
            onChange={(e) => setAddressReceiver(e.target.value)}
          />

          {/* Level Input */}
          <InputNumber
              value={level}
              min={1}
              max={maxLevel || undefined}
              step={1}
              placeholder="Base skill level"
              onChange={(value) => setLevel(value)}
          />

          {/* Max Level Input */}
          
          <InputNumber
            value={maxLevel}
            min={level || 0}
            step={1}
            placeholder="Max  skill level"
            onChange={(value) => setMaxLevel(value)}
          />

        
          <VStack w="full" h="30px">
            {/* Error message display */}
            <Text w="full" align="center" color="red" display={error ? "block" : "none"}>
              {error}
            </Text>
          </VStack>
        </VStack>
        {transactionHash &&  <ChakraLink
    href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
    isExternal
    textDecoration="underline"
  >
    Transaction Hash: {transactionHash}
  </ChakraLink>}
        {isConfirming && <Text>Waiting for confirmation...</Text>}
        {isConfirmed && <Text>Transaction confirmed!</Text>}
        

      </VStack>
    </Layout>
  );
}
