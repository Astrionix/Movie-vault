import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MagicLinkEmailProps {
  url: string;
  host: string;
}

export const MagicLinkEmail = ({ url, host }: MagicLinkEmailProps) => {
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const logoSrc = `${baseUrl}/logo.png`;

  return (
    <Html>
      <Head />
      <Preview>Your secure access to Movie Vault</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Link href={baseUrl}>
              <Img
                src={logoSrc}
                width="64"
                height="64"
                alt="Movie Vault Logo"
                style={logo}
              />
            </Link>
          </Section>

          <Heading style={heading}>Welcome back to Movie Vault</Heading>

          <Text style={bodyText}>
            You’ve requested to sign in to your Movie Vault account. Click the
            button below to log in securely.
          </Text>

          <Section style={buttonContainer}>
            <Link href={url} style={button}>
              Sign in to Movie Vault
            </Link>
          </Section>

          <Text style={bodyText}>
            If you did not request this sign-in, you can safely ignore this
            email. Your account remains secure.
          </Text>

          <Section style={footerSection}>
            <Text style={footerText}>
              Need help?{" "}
              <Link href={`${baseUrl}/contact`} style={link}>
                Contact our support team
              </Link>
              .
            </Text>
            <Text style={footerText}>
              Movie Vault |{" "}
              <Link href={baseUrl} style={link}>
                Visit website
              </Link>
            </Text>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} Movie Vault. All rights
              reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default MagicLinkEmail;

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: "40px 10px",
  minHeight: "100vh",
};

const container = {
  backgroundColor: "#111111",
  border: "1px solid #333",
  borderRadius: "16px",
  padding: "40px",
  maxWidth: "450px",
  margin: "0 auto",
  width: "100%",
};

const logoSection = {
  marginBottom: "24px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
  borderRadius: "8px",
};

const heading = {
  fontSize: "22px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const bodyText = {
  fontSize: "15px",
  color: "#a1a1aa",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
  lineHeight: "24px",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#D247BF",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 24px",
  display: "inline-block",
};

const link = {
  color: "#D247BF",
  textDecoration: "underline",
};

const footerSection = {
  borderTop: "1px solid #333",
  paddingTop: "20px",
  marginTop: "20px",
};

const footerText = {
  fontSize: "12px",
  color: "#71717a",
  textAlign: "center" as const,
  margin: "8px 0",
};
