import {
  StyleProps,
  Text,
  HStack,
  UnorderedList,
  Box,
  Button,
  ListItem,
  ListProps,
  VStack,
} from "@chakra-ui/react";

import { IndexService } from '@ethsign/sp-sdk';
import React, { useState, useEffect, useRef } from "react";
import colors from "@/theme/colors";
import { Arrow, Skull } from "./icons";
import { decodeAttestationData } from '@/utils/decoders'; // Adjust this path as needed

const getAttestationListFromIndexService = async () => {
  const indexService = new IndexService("testnet");
  const res = await indexService.queryAttestationList({ schemaId: "onchain_evm_11155111_0xfc", page: 1 });
  return res.rows;
};

const ITEMS_PER_PAGE = 5;

const Leaderboard = ({ nameEntry, ...props }) => {
  const [currentVersion, setCurrentVersion] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState(1);
  const [scores, setScores] = useState([]);
  const [visibleScores, setVisibleScores] = useState([]);
  const [page, setPage] = useState(1);

  const listRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const attestationData = await getAttestationListFromIndexService();
      // Decoding each attestation data using the helper function
      const decodedData = attestationData.map(attestation => ({
        ...attestation,
        decoded: decodeAttestationData(attestation.data)
      }));
      console.log("decodedDatadecoded",decodedData )
      setScores(decodedData);
      setVisibleScores(decodedData.slice(0, ITEMS_PER_PAGE)); // Initially load first 5
    };
    fetchData();
  }, []);

  const loadMore = () => {
    const newPage = page + 1;
    const newVisibleScores = scores.slice(0, newPage * ITEMS_PER_PAGE);
    setVisibleScores(newVisibleScores);
    setPage(newPage);
  };

  const onPrev = () => {
    if (selectedVersion > 1) {
      setSelectedVersion(selectedVersion - 1);
    }
  };

  const onNext = () => {
    if (selectedVersion < currentVersion) {
      setSelectedVersion(selectedVersion + 1);
    }
  };

  return (
    <VStack w="full" h="100%">
      <VStack my="15px">
        <HStack>
          <Arrow
            direction="left"
            cursor="pointer"
            opacity={selectedVersion > 1 ? "0x464" : "0.25"}
            onClick={onPrev}
          />
          <Text textStyle="subheading" fontSize="12px">
            Latest attestations <small>(0x464)</small>
          </Text>
          <Arrow
            direction="right"
            cursor="pointer"
            opacity={selectedVersion < currentVersion ? "1" : "0.25"}
            onClick={onNext}
          />
        </HStack>
      </VStack>

      <VStack
        boxSize="full"
        gap="20px"
        maxH={["calc(100vh - 460px)", "calc(100vh - 480px)"]}
        sx={{
          overflowY: "scroll",
        }}
        __css={{
          "scrollbar-width": "none",
        }}
      >
        <UnorderedList boxSize="full" variant="dotted" h="auto" ref={listRef}>
          {visibleScores && visibleScores.length > 0 ? (
            visibleScores.map((score, index) => {
              const playerName = score.from.slice(0, 10); // First 10 letters of attester
              const money = score.decoded.info; // Using decoded addressIssuer
              const link = `https://testnet-scan.sign.global/attestation/${score.id}`; // Link to attestation

              const color = colors.neon["200"].toString();
              const avatarColor = "green"; // Set a fixed avatar color for simplicity

              return (
                <ListItem color={color} key={score.id}>
                  <HStack mr={3}>
                    <Text w={["10px", "30px"]} fontSize={["10px", "16px"]} flexShrink={0}>
                      {index + 1}.
                    </Text>
                    <Box flexShrink={0} style={{ marginTop: "-8px" }} cursor="pointer">
                      {score.dead ? (
                        <Skull color={avatarColor} hasCrown={index === 0} />
                      ) : (
                        <Box bg={avatarColor} w="30px" h="30px" borderRadius="50%" />
                      )}
                    </Box>
                    <HStack>
                      <Text flexShrink={0} maxWidth={["150px", "350px"]} whiteSpace="nowrap" overflow="hidden" fontSize={["12px", "16px"]}>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {playerName}
                        </a>
                      </Text>
                    </HStack>
                    <Text
                      backgroundImage={`radial-gradient(${color} 20%, transparent 20%)`}
                      backgroundSize="10px 10px"
                      backgroundPosition="left center"
                      backgroundRepeat="repeat-x"
                      flexGrow={1}
                      color="transparent"
                    >
                      {"."}
                    </Text>
                    <Text flexShrink={0} fontSize={["12px", "16px"]}>
                      {money}
                    </Text>
                  </HStack>
                </ListItem>
              );
            })
          ) : (
            <Text textAlign="center" color="neon.500">
              No attestations found
            </Text>
          )}
        </UnorderedList>
      </VStack>

      {visibleScores.length < scores.length && (
        <Button minH="40px" variant="pixelated" onClick={loadMore}>
          Load More
        </Button>
      )}
    </VStack>
  );
};

export default Leaderboard;
