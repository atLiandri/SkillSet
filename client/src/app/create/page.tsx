// @ts-nocheck
"use client"
import { Arrow, Car } from "../../components/icons";
import Layout from "../../components/Layout";
import Button from "../../components/Button";
import { Inventory } from "../../components/Inventory";
import colors from "../../theme/colors";
import BorderImage from "../../components/icons/BorderImage";
import {
  Box,
  HStack,
  VStack,
  Text,
  Card,
  Grid,
  GridItem,
  useDisclosure,
} from "@chakra-ui/react";
import {
  getDrugById,
  getLocationById,
  getLocationByType,
  locations,
  sortDrugMarkets,
} from "../../utils/helpers";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatCash, generatePixelBorderPath } from "../../utils/ui";
import { Map } from "../../components/map";
import { useToast } from "../../hooks/toast";
import { Footer } from "../../components/Footer";

interface MarketPriceInfo {
  id: string;
  price: number;
  diff?: number;
  percentage?: number;
}

export default function Travel() {
  const router = useRouter();
  const gameId = "router.query.gameId as string";
  const [targetId, setTargetId] = useState<string>();
  const [currentLocationId, setCurrentLocationId] = useState<string>();

  const toaster = useToast();

  const locationName = useMemo(() => {
    if (targetId) {
      return getLocationById(targetId)?.name;
    }
  }, [targetId]);

  useEffect(() => {
    // Dummy setup for setting the initial location
    setCurrentLocationId("central");
    setTargetId("central");
  }, []);

  const prices = useMemo(() => {
    // Dummy prices for now
    const current = [
      { id: "drug1", price: 500 },
      { id: "drug2", price: 300 },
    ];
    const target = [
      { id: "drug1", price: 550 },
      { id: "drug2", price: 290 },
    ];

    return target.map((drug, index) => {
      const diff = drug.price - current[index].price;
      const percentage = (Math.abs(drug.price - current[index].price) / current[index].price) * 100;

      return {
        id: drug.id,
        price: drug.price,
        diff,
        percentage,
      } as MarketPriceInfo;
    });
  }, [targetId, currentLocationId]);

  const onNext = useCallback(() => {
    const idx = locations.findIndex((location) => location.id === targetId);
    if (idx < locations.length - 1) {
      setTargetId(locations[idx + 1].id);
    } else {
      setTargetId(locations[0].id);
    }
  }, [targetId]);

  const onBack = useCallback(() => {
    const idx = locations.findIndex((location) => location.id === targetId);
    if (idx > 0) {
      setTargetId(locations[idx - 1].id);
    } else {
      setTargetId(locations[locations.length - 1].id);
    }
  }, [targetId]);

  const onContinue = useCallback(() => {
    if (targetId) {
      const locationSlug = getLocationById(targetId)!.slug;
      router.push(`/${gameId}/${locationSlug}`);
    }
  }, [targetId, router, gameId]);

  if (!targetId || !prices) return <></>;

  return (
    <Layout
      leftPanelProps={{
        title: "Destination",
        prefixTitle: "Select Your",
        map: (
          <Map
            target={getLocationById(targetId)?.type}
            current={getLocationById(currentLocationId)?.type}
            onSelect={(selected) => {
              setTargetId(getLocationByType(selected)!.id);
            }}
          />
        ),
      }}
      footer={
        <Footer>
          <Button isDisabled={!targetId || targetId === currentLocationId} w={["full", "auto"]} px={["auto", "20px"]} onClick={onContinue}>
            Travel
          </Button>
        </Footer>
      }
    >
      <VStack w="full" my="auto" display={["none", "flex"]} gap="20px" overflow={"visible"}>
        <VStack w="full" align="flex-start">
          <Inventory />
          <Text textStyle="subheading" pt={["0px", "20px"]} fontSize="11px" color="neon.500">
            Location
          </Text>
          <LocationSelectBar name={locationName} onNext={onNext} onBack={onBack} />
        </VStack>
        <LocationPrices prices={prices} />
      </VStack>
      <VStack
        display={["flex", "none"]}
        w="full"
        h="auto"
        p="60px 16px 86px 16px"
        position="fixed"
        bottom="0"
        right="0"
        spacing="0"
        pointerEvents="none"
        justify="flex-end"
        background="linear-gradient(transparent, 10%, #172217, 25%, #172217)"
        gap="14px"
        overflow={"visible"}
      >
        {/* <Inventory /> */}
        <LocationSelectBar name={locationName} onNext={onNext} onBack={onBack} />
        <LocationPrices prices={prices} isCurrentLocation={currentLocationId ? targetId === currentLocationId : true} />
      </VStack>
    </Layout>
  );
}

const LocationPrices = ({ prices, isCurrentLocation }: { prices: MarketPriceInfo[]; isCurrentLocation?: boolean }) => {
  const { isOpen: isPercentage, onToggle: togglePercentage } = useDisclosure();

  return (
    <VStack w="full">
      <HStack w="full" justify="space-between" color="neon.500" display={["none", "flex"]}>
        <Text textStyle="subheading" fontSize="11px">
          Prices
        </Text>
        <Text
          cursor="pointer"
          onClick={togglePercentage}
          fontSize="18px"
          userSelect="none"
          pointerEvents="all"
        >
          ({!isPercentage ? "#" : "%"})
        </Text>
      </HStack>
      <Card
        w="full"
        p="5px"
        pointerEvents="all"
        sx={{
          borderImageSource: `url("data:image/svg+xml,${BorderImage({
            color: colors.neon["700"].toString(),
          })}")`,
        }}
      >
        <Grid templateColumns="repeat(2, 1fr)" position="relative">
          <Box position="absolute" boxSize="full" border="2px" borderColor="neon.900" />
          {prices.map((drug, index) => {
            return (
              <GridItem key={index} colSpan={1} border="1px" p="6px" borderColor="neon.600">
                <HStack gap="8px">
                  {getDrugById(drug.id)?.icon({
                    boxSize: "24px",
                  })}
                  <Text display={isCurrentLocation ? "block" : ["none", "block"]}>${drug.price.toFixed(0)}</Text>
                  {drug.percentage && drug.diff && drug.diff !== 0 && (
                    <Text opacity="0.5" color={drug.diff >= 0 ? "neon.200" : "red"}>
                      ({!isPercentage ? `${drug.percentage.toFixed(0)}%` : formatCash(drug.diff)})
                    </Text>
                  )}
                </HStack>
              </GridItem>
            );
          })}
        </Grid>
      </Card>
    </VStack>
  );
};

const LocationSelectBar = ({ name, onNext, onBack }: { name?: string; onNext: () => void; onBack: () => void }) => {
  return (
    <HStack w="full" pointerEvents="all">
      <Arrow style="outline" direction="left" boxSize="48px" userSelect="none" cursor="pointer" onClick={onBack} />
      <HStack p={2} bg="neon.700" clipPath={`polygon(${generatePixelBorderPath()})`} w="full" justify="center">
        <Text>{name}</Text>
      </HStack>
      <Arrow style="outline" direction="right" boxSize="48px" userSelect="none" cursor="pointer" onClick={onNext} />
    </HStack>
  );
};
