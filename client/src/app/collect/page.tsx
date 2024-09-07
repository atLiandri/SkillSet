"use client"
import { Footer } from "../../components/Footer";
import Layout from "../../components/Layout";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Alert, Arrow } from "../../components/icons";
import { InputNumber } from "../../components/InputNumber";
import { VStack, HStack, Text, Card, Link as ChakraLink , Heading, Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState, useEffect  } from "react";
import { useToast } from "../../hooks/toast";
import { useWaitForTransactionReceipt, useWriteContract, useReadContract, useAccount} from 'wagmi';
import { abi } from "@/utils/abi";

// Simple regex for Ethereum address validation
const isValidEthereumAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

export default function New() {
  const { address } = useAccount();
  

const { data: index } = useReadContract({
  address: '0xa15310D13b760fA214d2275f85bBDfCc12F63323',
  abi: abi, 
  functionName: 'getProposalsReceivedBy',
  args: ['0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E'],
})

// Ensure data is available and destructure the result
const addressArray = index ? index[0] : []; // index[0] is the address[] part
const uint256Array = index ? index[1] : []; // index[1] is the uint256[] part

return (
  <>
      <Layout
        isSinglePanel
        footer={
          <Footer>
            
              <Button
                w="full"
                px={["auto", "20px"]}

              >
                claim
              </Button>
           
          </Footer>
        }
      >
        <VStack h="full">
          <VStack>
            <Text textStyle="subheading" fontSize={["10px", "11px"]} letterSpacing="0.25em">
              "outcome.title"
            </Text>
            <Heading fontSize={["36px", "48px"]} fontWeight="400" textAlign="center">
              "outcome.name"
            </Heading>
          </VStack>
          {/* <Image alt={"outcome"} src={} maxH="50vh" height="500px" /> */}
          <VStack width="full" maxW="500px" h="100%" justifyContent="space-between">
            <VStack textAlign="center">
              <Text>"response"</Text>
              <Text color="yellow.400">Addresses: {addressArray?.join(', ')}</Text>
              <Text color="yellow.400">Values: {uint256Array?.join(', ')}</Text>
            </VStack>
          </VStack>
          <Box display="block" minH="70px" h="70px" w="full" />
        </VStack>
      </Layout>
    </>
 
);
}


