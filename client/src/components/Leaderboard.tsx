import {
  StyleProps,
  Text,
  HStack,
  UnorderedList,
  Box,
  Button,
  ListItem,
  ListProps,
  Modal,
  ModalOverlay,
  useDisclosure,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  VStack,
} from "@chakra-ui/react";
import Input from "@/components/Input";

import React, { useState, useEffect, useRef } from "react";
import colors from "@/theme/colors";
import { Arrow, Skull } from "./icons";
// import Countdown from "react-countdown";
import { formatCash } from "@/utils/ui";

const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    return <Text>RESETS NEXT GAME</Text>;
  } else {
    if (Number.isNaN(days)) {
      days = 4;
      hours = 20;
      minutes = 4;
      seconds = 20;
    }
    return (
      <HStack textStyle="subheading" fontSize="12px">
        <Text color="neon.500">RESETS IN:</Text>
        <Text>
          {days > 0 ? `${days}D` : ""} {hours.toString().padStart(2, "0")}H {minutes.toString().padStart(2, "0")}m{" "}
          {seconds.toString().padStart(2, "0")}s
        </Text>
      </HStack>
    );
  }
};

const Leaderboard = ({ nameEntry, ...props }) => {
  const [currentVersion, setCurrentVersion] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState(1);
  const [scores, setScores] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  const listRef = useRef(null);

  useEffect(() => {
    // Dummy data for scores
    const dummyScores = [
      { gameId: 'game1', playerId: '0x538cFD76c', cash: 5000, name: '0x538cFD76c', dead: false },
      { gameId: 'game2', playerId: '0x538cFD76c', cash: 3000, name: '0x538cFD76c', dead: false },
      { gameId: 'game3', playerId: '0x538cFD76c', cash: 7000, name: '0x538cFD76c', dead: false },
    ];
    setScores(dummyScores);
    setHasNextPage(true);
  }, []);

  const onPrev = async () => {
    if (selectedVersion > 1) {
      setSelectedVersion(selectedVersion - 1);
    }
  };

  const onNext = async () => {
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
        {/* {selectedVersion === currentVersion && (
          <Countdown date={Date.now() + 1000000000} renderer={renderer} />
        )} */}
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
          {scores && scores.length > 0 ? (
            scores.map((score, index) => {
              const isOwn = false; // No account check for now
              const color = isOwn ? colors.yellow["400"].toString() : colors.neon["200"].toString();
              const avatarColor = isOwn ? "yellow" : "green";
              const displayName = score.name ? `${score.name}${isOwn ? " (you)" : ""}` : "Anonymous";

              return (
                <ListItem color={color} key={score.gameId}>
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
                        {displayName}
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
                      {formatCash(score.cash)}
                    </Text>
                  </HStack>
                </ListItem>
              );
            })
          ) : (
            <Text textAlign="center" color="neon.500">
              No scores submitted yet
            </Text>
          )}
        </UnorderedList>
      </VStack>

      {hasNextPage && (
        <Button minH="40px" variant="pixelated" onClick={() => setHasNextPage(false)}>
          Load More
        </Button>
      )}
    </VStack>
  );
};

export default Leaderboard;
