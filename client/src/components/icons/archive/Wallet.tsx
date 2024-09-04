import { Icon, IconProps } from ".";

export const Wallet = (props: IconProps) => {
  const { variant } = props;

  return (
    <Icon {...props}>
      {variant === "mirrored" ? (
        <path d="M8 6L7 4L6 6L4 7L6 8L7 10L8 8L10 7L8 6ZM16 10L14 6L12 10L8 12L12 14L14 18L16 14L20 12L16 10ZM7 14L6 16L4 17L6 18L7 20L8 18L10 17L8 16L7 14Z" />
      ) : (
        <path d="M4.75 5H4V5.75V18.25V19H4.75H19.25H20V18.25V8.75V8H19.25H7.75H7V9.5H7.75H18.5V17.5H5.5V6.5H18.25H19V5H18.25H4.75ZM16 14.5C16.2652 14.5 16.5196 14.3946 16.7071 14.2071C16.8946 14.0196 17 13.7652 17 13.5C17 13.2348 16.8946 12.9804 16.7071 12.7929C16.5196 12.6054 16.2652 12.5 16 12.5C15.7348 12.5 15.4804 12.6054 15.2929 12.7929C15.1054 12.9804 15 13.2348 15 13.5C15 13.7652 15.1054 14.0196 15.2929 14.2071C15.4804 14.3946 15.7348 14.5 16 14.5Z" />
      )}
    </Icon>
  );
};
