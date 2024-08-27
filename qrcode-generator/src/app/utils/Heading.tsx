"use client";

interface HeadingProps {
  title: string;
}

const Heading = ({ title }: HeadingProps) => {
  return (
    <div>
      <title>{title}</title>
      <meta name="name" content="width=device-width, initial-scale=1" />
    </div>
  );
};

export default Heading;
