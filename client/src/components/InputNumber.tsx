import { HStack, Text, StyleProps, Spacer } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { ArrowInput } from "./icons";

export interface InputNumberProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  placeholder?: string;
  onChange: (_: number) => void;
}

export const InputNumber = ({
  min = 0,
  max,
  step = 1,
  value,
  placeholder = "",
  onChange,
  ...props
}: InputNumberProps & StyleProps) => {
  const [isFlashed, setIsFlashed] = useState(false);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);

  useEffect(() => {
    if (value !== 0) {
      setIsPlaceholderVisible(false);
    } else {
      setIsPlaceholderVisible(true);
    }
  }, [value]);

  const onClick = (newValue: number) => {
    setIsFlashed(true);
    onChange(newValue);
    setTimeout(() => {
      setIsFlashed(false);
    }, 200);
  };

  return (
    <HStack w="full" {...props}>
      {isPlaceholderVisible ? (
        <Text color="gray.400">{placeholder}</Text>
      ) : (
        <Text
          color={isFlashed ? "neon.900" : "neon.200"}
          backgroundColor={isFlashed ? "neon.200" : "transparent"}
        >
          {value}
        </Text>
      )}
      <Spacer />
      <ArrowInput
        size="md"
        cursor="pointer"
        disabled={max && value >= max ? true : false}
        onClick={() => onClick(value + step)}
      />
      <ArrowInput
        size="md"
        direction="down"
        cursor="pointer"
        disabled={value <= min ? true : false}
        onClick={() => onClick(value - step)}
      />
    </HStack>
  );
};
